import { Request, Response } from "express";
import {
  getAllHospitals as getAllHospitalsService,
  createHospital as createHospitalService,
  updateHospital as updateHospitalService,
  getHospitalById as getHospitalByIdService,
  CreateHospitalData,
  UpdateHospitalData,
} from "../services/hospitalService";

// ============================================
// ADMIN HOSPITAL MANAGEMENT ROUTES
// ============================================

export const getAllHospitals = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getAllHospitalsService({ page, limit });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching hospitals",
        error: error.message,
      });
  }
};

export const createHospital = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log("hospitall dfa", req.body);
  try {
    const { name, city } = req.body;

    // Input validation
    if (!name || !city) {
      res
        .status(400)
        .json({ success: false, message: "Name and city are required" });
      return;
    }

    const hospitalData: CreateHospitalData = { name, city };

    const hospital = await createHospitalService(hospitalData);

    res.status(201).json({
      success: true,
      message: "Hospital created successfully",
      data: hospital,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res
        .status(400)
        .json({ success: false, message: "Hospital ID already exists" });
      return;
    }
    res
      .status(500)
      .json({
        success: false,
        message: "Error creating hospital",
        error: error.message,
      });
  }
};

export const updateHospital = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { hospitalId } = req.params;
    const { name, city } = req.body;

    // Input validation
    if (!name && !city) {
      res
        .status(400)
        .json({
          success: false,
          message: "At least one field (name or city) is required",
        });
      return;
    }

    const updateData: UpdateHospitalData = { name, city };

    const hospital = await updateHospitalService(
      hospitalId as string,
      updateData,
    );

    res.status(200).json({
      success: true,
      message: "Hospital updated successfully",
      data: hospital,
    });
  } catch (error: any) {
    if (error.message === "Hospital not found") {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    res
      .status(500)
      .json({
        success: false,
        message: "Error updating hospital",
        error: error.message,
      });
  }
};

export const getHospitalById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { hospitalId } = req.params;

    const hospital = await getHospitalByIdService(hospitalId as string);

    res.status(200).json({
      success: true,
      data: hospital,
    });
  } catch (error: any) {
    if (error.message === "Hospital not found") {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching hospital",
        error: error.message,
      });
  }
};

// ============================================
// Add other user role routes here (doctor, receptionist, etc.)
// ============================================
