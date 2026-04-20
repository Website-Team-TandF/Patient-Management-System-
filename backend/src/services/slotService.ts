import { SlotWindow } from "../models/SlotWindow";
import { Appointment } from "../models/Appointment";
import { Types } from "mongoose";

export interface CreateSlotsData {
  hospitalId: string;
  slotDuration: number; // in minutes
  maxCapacity: number;
  startDate: string;
  endDate: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Generate time slots from given start time to end time
 */
export const generateTimeSlots = (
  startTimeStr: string,
  endTimeStr: string,
  durationMinutes: number,
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const [startHour, startMinute] = startTimeStr.split(":").map(Number);
  const [endHour, endMinute] = endTimeStr.split(":").map(Number);

  let currentHour = startHour;
  let currentMinute = startMinute;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMinute < endMinute)
  ) {
    const startTime = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;

    // Calculate end time
    let tempMinute = currentMinute + durationMinutes;
    let tempHour = currentHour;
    while (tempMinute >= 60) {
      tempMinute -= 60;
      tempHour += 1;
    }

    // Stop if end time exceeds specified end time
    if (
      tempHour > endHour ||
      (tempHour === endHour && tempMinute > endMinute)
    ) {
      break;
    }

    const endTime = `${String(tempHour).padStart(2, "0")}:${String(tempMinute).padStart(2, "0")}`;

    slots.push({ startTime, endTime });

    // Move to next slot start time
    currentMinute += durationMinutes;
    while (currentMinute >= 60) {
      currentMinute -= 60;
      currentHour += 1;
    }
  }

  return slots;
};

/**
 * Create slots for a hospital
 */
export const createSlots = async (
  slotData: CreateSlotsData,
  hospitalObjectId: Types.ObjectId,
) => {
  const { slotDuration, maxCapacity, startDate, endDate, startTime, endTime } =
    slotData;

  const startStr = startDate.includes("T") ? startDate.split("T")[0] : startDate;
  const endStr = endDate.includes("T") ? endDate.split("T")[0] : endDate;

  // Explicitly construct UTC dates that represent the exact IST time
  const start = new Date(`${startStr}T00:00:00+05:30`);
  const end = new Date(`${endStr}T00:00:00+05:30`);

  if (start > end) {
    throw new Error("Start date cannot be after end date");
  }

  const today = new Date();
  const istNow = new Date(today.getTime() + 5.5 * 60 * 60 * 1000);
  const todayISTStr = istNow.toISOString().split("T")[0];
  const todayISTStart = new Date(`${todayISTStr}T00:00:00+05:30`);

  if (start < todayISTStart) {
    throw new Error("Start date cannot be in the past");
  }

  // Calculate total days
  const numberOfDays =
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  if (numberOfDays > 30) {
    throw new Error("Cannot create slots for more than 30 days at once");
  }

  // Check 30-day limit from today for any slots
  const thirtyDaysFromNow = new Date(todayISTStart);
  thirtyDaysFromNow.setDate(todayISTStart.getDate() + 30);
  if (end > thirtyDaysFromNow) {
    throw new Error("Cannot create slots more than 30 days into the future");
  }

  // Generate time slots for one day
  const timeSlots = generateTimeSlots(startTime, endTime, slotDuration);

  if (timeSlots.length === 0) {
    throw new Error(
      "Invalid parameters: No slots can be created with given times and duration",
    );
  }

  // Create slots for each day
  const slotsToCreate: any[] = [];

  for (let day = 0; day < numberOfDays; day++) {
    const currentDay = new Date(start.getTime() + day * 24 * 60 * 60 * 1000);
    // currentDay represents 00:00 IST in UTC. Convert to IST string to get correct YYYY-MM-DD
    const currentDayIST = new Date(currentDay.getTime() + 5.5 * 60 * 60 * 1000);
    const dayStr = currentDayIST.toISOString().split("T")[0];

    const slotDate = new Date(`${dayStr}T00:00:00+05:30`);

    let slotNumber = 1; // Initialize slot number for each day
    for (const timeSlot of timeSlots) {
      // Combine slotDate and time string to create a proper Date object explicitly in IST
      const startTimeDate = new Date(`${dayStr}T${timeSlot.startTime}:00+05:30`);
      const endTimeDate = new Date(`${dayStr}T${timeSlot.endTime}:00+05:30`);

      slotsToCreate.push({
        hospitalId: hospitalObjectId,
        startTime: startTimeDate,
        endTime: endTimeDate,
        slotDate,
        maxCapacity,
        bookedCount: 0,
        slotNumber: slotNumber++, // Use incrementing slot number
      });
    }
  }

  // Insert all slots
  const createdSlots = await SlotWindow.insertMany(slotsToCreate);

  return {
    slotsCreated: createdSlots.length,
    days: numberOfDays,
    slotsPerDay: timeSlots.length,
  };
};

/**
 * Get slots by hospital with pagination
 */
export const getSlotsByHospital = async (
  hospitalObjectId: Types.ObjectId,
  options: PaginationOptions,
): Promise<PaginatedResult<any>> => {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const now = new Date();
  const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const todayISTStr = istNow.toISOString().split("T")[0];
  const todayISTStart = new Date(`${todayISTStr}T00:00:00+05:30`);

  const slots = await SlotWindow.find({
    hospitalId: hospitalObjectId,
    startTime: { $gte: todayISTStart },
  })
    .sort({ slotDate: 1, startTime: 1 })
    .skip(skip)
    .limit(limit)
    .select("-__v")
    .populate("hospitalId", "name city");

  const total = await SlotWindow.countDocuments({
    hospitalId: hospitalObjectId,
  });

  return {
    data: slots,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get slot by ID
 */
export const getSlotById = async (slotId: string) => {
  if (!Types.ObjectId.isValid(slotId)) {
    throw new Error("Invalid slot ID");
  }

  const slot = await SlotWindow.findById(slotId)
    .select("-__v")
    .populate("hospitalId", "name city");

  if (!slot) {
    throw new Error("Slot not found");
  }

  return slot;
};

/**
 * Delete slot (only if no bookings)
 */
export const deleteSlot = async (slotId: string) => {
  if (!Types.ObjectId.isValid(slotId)) {
    throw new Error("Invalid slot ID");
  }

  // Check if slot exists
  const slot = await SlotWindow.findById(slotId);
  if (!slot) {
    throw new Error("Slot not found");
  }

  // Check if slot has any bookings
  const appointments = await Appointment.find({
    slotWindowId: slot._id,
    status: { $ne: "cancelled" },
  });

  if (appointments.length > 0) {
    throw new Error(
      `Cannot delete slot: Slot has ${appointments.length} active booking(s)`,
    );
  }

  // Delete the slot
  await SlotWindow.findByIdAndDelete(slotId);
};

/**
 * Delete all slots for a specific date (only if no bookings)
 */
export const deleteSlotsByDate = async (
  hospitalObjectId: Types.ObjectId,
  dateStr: string,
) => {
  const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const targetDate = new Date(`${datePart}T00:00:00+05:30`);

  // Find all slots for this hospital and date
  const slots = await SlotWindow.find({
    hospitalId: hospitalObjectId,
    slotDate: targetDate,
  });

  if (slots.length === 0) {
    throw new Error("No slots found for the specified date");
  }

  // Check if any slot has bookings
  const bookedSlots = slots.filter((s: any) => s.bookedCount > 0);
  if (bookedSlots.length > 0) {
    throw new Error(
      `Cannot delete slots: ${bookedSlots.length} slots already have bookings`,
    );
  }

  // Delete all slots for this date
  await SlotWindow.deleteMany({
    hospitalId: hospitalObjectId,
    slotDate: targetDate,
  });

  return { deletedCount: slots.length };
};
