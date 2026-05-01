import { Hospital } from "../models/Hospital";
import { SlotWindow } from "../models/SlotWindow";
import { Appointment } from "../models/Appointment";
import { Types } from "mongoose";

export interface CreateHospitalData {
  name: string;
  city: string;
}

export interface UpdateHospitalData {
  name?: string;
  city?: string;
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
 * Get all hospitals with pagination
 */
export const getAllHospitals = async (
  options: PaginationOptions,
): Promise<PaginatedResult<any>> => {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const hospitals = await Hospital.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-__v")
    .lean();

  const total = await Hospital.countDocuments();

  // Aggregate slot time ranges for each hospital
  const hospitalIds = hospitals.map((h: any) => h._id);
  const slotTimeRanges = await SlotWindow.aggregate([
    { $match: { hospitalId: { $in: hospitalIds } } },
    {
      $group: {
        _id: "$hospitalId",
        earliestStart: { $min: "$startTime" },
        latestEnd: { $max: "$endTime" },
        totalSlots: { $sum: 1 },
      },
    },
  ]);

  // Build a map of hospitalId -> time range
  const timeRangeMap: Record<string, any> = {};
  for (const range of slotTimeRanges) {
    timeRangeMap[range._id.toString()] = {
      earliestStart: range.earliestStart,
      latestEnd: range.latestEnd,
      totalSlots: range.totalSlots,
    };
  }

  // Merge time ranges into hospital data
  const enrichedHospitals = hospitals.map((h: any) => {
    const timeRange = timeRangeMap[h._id.toString()];
    return {
      ...h,
      slotTimeRange: timeRange || null,
    };
  });

  return {
    data: enrichedHospitals,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get hospital by _id
 */
export const getHospitalById = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid hospital ID");
  }
  const hospital = await Hospital.findById(id).select("-__v");
  if (!hospital) {
    throw new Error("Hospital not found");
  }
  return hospital;
};

/**
 * Create a new hospital
 */
export const createHospital = async (hospitalData: CreateHospitalData) => {
  console.log("comin here", hospitalData);
  const hospital = new Hospital({
    name: hospitalData.name.trim(),
    city: hospitalData.city.trim(),
  });
  console.log("comin here but", hospitalData);

  try {
    await hospital.save();
  } catch (err) {
    console.log("error in hospital creation", err, hospital);
    throw err;
  }
  console.log("comin here also", hospital);

  return hospital;
};

/**
 * Update hospital
 */
export const updateHospital = async (
  id: string,
  updateData: UpdateHospitalData,
) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid hospital ID");
  }

  const updateFields: { name?: string; city?: string } = {};
  if (updateData.name) updateFields.name = updateData.name.trim();
  if (updateData.city) updateFields.city = updateData.city.trim();

  const hospital = await Hospital.findByIdAndUpdate(id, updateFields, {
    new: true,
    runValidators: true,
  }).select("-__v");

  if (!hospital) {
    throw new Error("Hospital not found");
  }

  return hospital;
};

/**
 * Delete hospital and all its related slots
 */
export const deleteHospital = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid hospital ID");
  }

  const hospital = await Hospital.findById(id);
  if (!hospital) {
    throw new Error("Hospital not found");
  }

  // Check for active appointments
  const activeAppointments = await Appointment.countDocuments({
    hospitalId: new Types.ObjectId(id),
    status: { $nin: ["cancelled", "completed"] },
  });

  if (activeAppointments > 0) {
    throw new Error(
      `Cannot delete hospital: ${activeAppointments} active appointment(s) exist. Cancel or complete them first.`
    );
  }

  // Delete all slots for this hospital
  await SlotWindow.deleteMany({ hospitalId: new Types.ObjectId(id) });

  // Delete the hospital
  await Hospital.findByIdAndDelete(id);

  return { message: "Hospital and all associated slots deleted successfully" };
};

/**
 * Find hospital by _id (returns ObjectId for internal use)
 */
export const findHospitalObjectId = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid hospital ID");
  }
  const hospital = await Hospital.findById(id);
  if (!hospital) {
    throw new Error("Hospital not found");
  }
  return hospital;
};
