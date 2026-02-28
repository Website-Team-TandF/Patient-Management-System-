import { SlotWindow } from '../models/SlotWindow';
import { SlotLock } from '../models/SlotLock';
import { Appointment } from '../models/Appointment';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get available slots for a hospital (public endpoint)
 * Returns slots with real-time availability accounting for both bookedCount and active locks
 */
export const getPublicSlots = async (hospitalId: string, date?: string) => {
  if (!Types.ObjectId.isValid(hospitalId)) {
    throw new Error('Invalid hospital ID');
  }

  const hospitalObjectId = new Types.ObjectId(hospitalId);
  
  // Build query
  const query: any = { hospitalId: hospitalObjectId };
  
  // Filter by date if provided, otherwise get future slots
  if (date) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    query.slotDate = { $gte: targetDate, $lt: nextDay };
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    query.slotDate = { $gte: today };
  }

  // Get all slots
  const slots = await SlotWindow.find(query)
    .sort({ slotDate: 1, startTime: 1 })
    .select('-__v')
    .lean();

  // For each slot, count active locks (not yet booked, not expired)
  const slotsWithAvailability = await Promise.all(
    slots.map(async (slot) => {
      const activeLocksCount = await SlotLock.countDocuments({
        slotWindowId: slot._id,
        isBooked: false,
        expiresAt: { $gt: new Date() },
      });

      const available = slot.maxCapacity - slot.bookedCount - activeLocksCount;

      return {
        ...slot,
        id: slot._id.toString(),
        activeLocksCount,
        availableCount: Math.max(0, available),
        isFull: available <= 0,
      };
    })
  );

  return slotsWithAvailability;
};

/**
 * Get the next N calendar days that have at least one slot, starting from a given date.
 * Only returns date summaries (no per-slot data) to keep payload small.
 */
export const getNextSlotWindow = async (
  hospitalId: string,
  fromDate?: string,
  days: number = 7,
) => {
  if (!Types.ObjectId.isValid(hospitalId)) {
    throw new Error('Invalid hospital ID');
  }

  const hospitalObjectId = new Types.ObjectId(hospitalId);

  // Determine starting calendar date (midnight)
  const start = fromDate ? new Date(fromDate) : new Date();
  start.setHours(0, 0, 0, 0);

  // Fetch all future slots for this hospital (from start onwards)
  const slots = await SlotWindow.find({
    hospitalId: hospitalObjectId,
    slotDate: { $gte: start },
  })
    .sort({ slotDate: 1, startTime: 1 })
    .select('-__v')
    .lean();

  // If no slots at all, return empty
  if (slots.length === 0) {
    return [];
  }

  // Collect unique dates in ascending order
  const seen = new Set<string>();
  const dateBuckets: { [date: string]: typeof slots } = {};

  for (const slot of slots) {
    const d = new Date(slot.slotDate);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString();
    if (!seen.has(key)) {
      seen.add(key);
      dateBuckets[key] = [];
    }
    dateBuckets[key].push(slot);
  }

  const uniqueDates = Array.from(seen).sort();
  const pickedDates = uniqueDates.slice(0, days);

  // For each picked date, just return a summary (date + totalSlots)
  const results = pickedDates.map((dateStr) => {
    const daySlots = dateBuckets[dateStr] || [];
    return {
      date: dateStr,
      totalSlots: daySlots.length,
    };
  });

  return results;
};

/**
 * Create a slot lock when user proceeds to payment
 * Atomically checks capacity before creating lock
 */
export const createSlotLock = async (slotId: string) => {
  if (!Types.ObjectId.isValid(slotId)) {
    throw new Error('Invalid slot ID');
  }

  const slotObjectId = new Types.ObjectId(slotId);

  // Get the slot
  const slot = await SlotWindow.findById(slotObjectId);
  if (!slot) {
    throw new Error('Slot not found');
  }

  // OPTIMISTIC LOCKING STRATEGY:
  // 1. Initial capacity check
  const activeLocksCount = await SlotLock.countDocuments({
    slotWindowId: slotObjectId,
    isBooked: false,
    expiresAt: { $gt: new Date() },
  });

  const available = slot.maxCapacity - slot.bookedCount - activeLocksCount;
  if (available <= 0) {
    throw new Error('Slot is no longer available. Please select another slot.');
  }

  // 2. Insert the lock (Attempt)
  const bookingAttemptId = uuidv4();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);

  const slotLock = new SlotLock({
    slotWindowId: slotObjectId,
    bookingAttemptId,
    isBooked: false,
    expiresAt,
  });

  await slotLock.save();

  // 3. Post-insert validation (The "Double Check")
  // Count again to see if we exceeded capacity due to race condition
  const updatedActiveLocksCount = await SlotLock.countDocuments({
    slotWindowId: slotObjectId,
    isBooked: false,
    expiresAt: { $gt: new Date() },
  });

  const currentAvailable = slot.maxCapacity - slot.bookedCount - updatedActiveLocksCount;

  // If we exceeded capacity (available < 0 because we just added 1, so if it was 0 before, now it's -1),
  // we must rollback. Note: since we added 1, if currentAvailable is < 0, it means we overbooked.
  // Actually, if original available was 1, we added 1, used = 1. remaining = 0. OK.
  // If original available was 0, we added 1. remaining = -1. OVERBOOKED.
  if (currentAvailable < 0) {
    await SlotLock.findByIdAndDelete(slotLock._id);
    throw new Error('Slot is no longer available. Please select another slot.');
  }

  return {
    lockId: slotLock._id.toString(),
    bookingAttemptId,
    expiresAt,
    slot: {
      id: slot._id.toString(),
      startTime: slot.startTime,
      endTime: slot.endTime,
      slotNumber: slot.slotNumber,
    },
  };
};

/**
 * Release a slot lock (when user cancels payment)
 */
export const releaseSlotLock = async (lockId: string) => {
  if (!Types.ObjectId.isValid(lockId)) {
    throw new Error('Invalid lock ID');
  }

  const lock = await SlotLock.findById(lockId);
  if (!lock) {
    throw new Error('Lock not found');
  }

  // Only delete if not already booked
  if (lock.isBooked) {
    throw new Error('Cannot release a confirmed booking');
  }

  await SlotLock.findByIdAndDelete(lockId);

  return { success: true, message: 'Lock released successfully' };
};

/**
 * Confirm a booking after successful payment
 */
import Lead from '../models/Lead';

// ... (existing imports)

/**
 * Confirm a booking after successful payment
 */
export interface ConfirmBookingData {
  lockId: string;
  leadId: string;
  doctorId?: string;
  doctorName?: string;
  duration?: number;
  amount?: number;
}

export const confirmBooking = async (data: ConfirmBookingData) => {
  const { lockId, leadId, doctorId, doctorName, duration, amount } = data;

  if (!Types.ObjectId.isValid(lockId)) {
    throw new Error('Invalid lock ID');
  }

  if (!Types.ObjectId.isValid(leadId)) {
    throw new Error('Invalid lead ID');
  }

  // Fetch Lead details first
  const lead = await Lead.findById(leadId);
  if (!lead) {
    throw new Error('Lead not found. Cannot proceed with booking.');
  }

  // ATOMIC CHECK AND UPDATE
  // Attempt to mark as booked atomically. This prevents double-confirmation race conditions.
  const lock = await SlotLock.findOneAndUpdate(
    { 
      _id: lockId, 
      isBooked: false, 
      expiresAt: { $gt: new Date() } 
    },
    { isBooked: true },
    { new: true }
  );

  if (!lock) {
    throw new Error('Lock not found, expired, or already booked. Please try booking again.');
  }

  try {
    // Get the slot
    const slot = await SlotWindow.findById(lock.slotWindowId);
    if (!slot) {
      throw new Error('Slot not found');
    }

    // Helper to generate ID: 3 Uppercase Letters + 7 Digits
    const generateAppointmentId = () => {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const randomLetters = Array(3).fill(null).map(() => letters.charAt(Math.floor(Math.random() * letters.length))).join('');
      const randomDigits = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
      return `${randomLetters}${randomDigits}`;
    };

    // Retry logic for appointment creation
    let retries = 3;
    let appointment;
    let saved = false;

    while (retries > 0 && !saved) {
      try {
        const appointmentId = generateAppointmentId();
        
        appointment = new Appointment({
          appointmentId,
          name: lead.name,
          email: lead.email,
          phoneNo: lead.phoneNumber,
          healthIssue: lead.healthIssue,
          hospitalId: slot.hospitalId,
          mode: 'offline', // Default to offline for slot bookings
          status: 'booked',
          amountPaid: amount,
          duration: duration,
          appointmentDate: slot.slotDate,
          doctorId: doctorId ? new Types.ObjectId(doctorId) : undefined,
          doctorName,
          slotWindowId: slot._id,
          slotNumber: slot.slotNumber,
          slotStartTime: slot.startTime,
          slotEndTime: slot.endTime,
        });

        await appointment.save();
        saved = true;
      } catch (err: any) {
        // Check for duplicate key error (code 11000)
        if (err.code === 11000 && retries > 1) {
          console.warn(`Duplicate appointment ID generated, retrying... (${retries - 1} retries left)`);
          retries--;
          continue;
        }
        // If other error or no retries left, throw
        throw err;
      }
    }

    if (!appointment) {
      throw new Error('Failed to create appointment after retries');
    }

    // Increment bookedCount on the slot
    await SlotWindow.findByIdAndUpdate(slot._id, { $inc: { bookedCount: 1 } });

    // Note: Lock is already marked as booked.

    // Mark Lead as converted
    await Lead.findByIdAndUpdate(leadId, { isConverted: true });

    return {
      success: true,
      appointmentId: appointment.appointmentId,
      appointment: {
        id: appointment._id.toString(),
        appointmentId: appointment.appointmentId,
        slotNumber: slot.slotNumber,
        slotStartTime: slot.startTime,
        slotEndTime: slot.endTime,
        hospitalId: slot.hospitalId.toString(),
      },
    };
  } catch (error) {
    // ROLLBACK: If appointment creation fails, revert the lock status
    await SlotLock.findByIdAndUpdate(lockId, { isBooked: false });
    throw error;
  }
};
