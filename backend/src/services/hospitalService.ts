import { Hospital } from "../models/Hospital";
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
    .select("-__v");

  const total = await Hospital.countDocuments();

  return {
    data: hospitals,
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
