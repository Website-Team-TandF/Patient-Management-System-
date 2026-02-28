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

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  if (start > end) {
    throw new Error("Start date cannot be after end date");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    throw new Error("Start date cannot be in the past");
  }

  // Calculate total days
  const numberOfDays =
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  if (numberOfDays > 30) {
    throw new Error("Cannot create slots for more than 30 days at once");
  }

  // Check 30-day limit from today for any slots
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);
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
    const slotDate = new Date(start);
    slotDate.setDate(start.getDate() + day);
    slotDate.setHours(0, 0, 0, 0);

    let slotNumber = 1; // Initialize slot number for each day
    for (const timeSlot of timeSlots) {
      // Combine slotDate and time string to create a proper Date object
      const [startH, startM] = timeSlot.startTime.split(":").map(Number);
      const [endH, endM] = timeSlot.endTime.split(":").map(Number);

      const startTimeDate = new Date(slotDate);
      startTimeDate.setHours(startH, startM, 0, 0);

      const endTimeDate = new Date(slotDate);
      endTimeDate.setHours(endH, endM, 0, 0);

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
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const slots = await SlotWindow.find({
    hospitalId: hospitalObjectId,
    startTime: { $gte: today },
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
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);

  // Find all slots for this hospital and date
  const slots = await SlotWindow.find({
    hospitalId: hospitalObjectId,
    slotDate: date,
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
    slotDate: date,
  });

  return { deletedCount: slots.length };
};
