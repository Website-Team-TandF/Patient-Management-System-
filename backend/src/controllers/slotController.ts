import { Request, Response } from 'express';
import {
  createSlots as createSlotsService,
  getSlotsByHospital as getSlotsByHospitalService,
  deleteSlot as deleteSlotService,
  getSlotById as getSlotByIdService,
  deleteSlotsByDate as deleteSlotsByDateService,
  CreateSlotsData,
} from '../services/slotService';
import { findHospitalObjectId } from '../services/hospitalService';

// ============================================
// ADMIN SLOT MANAGEMENT ROUTES
// ============================================

export const createSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hospitalId, slotDuration, maxCapacity, startDate, endDate, startTime, endTime } = req.body;

    // Input validation
    if (!hospitalId || !slotDuration || !maxCapacity || !startDate || !endDate || !startTime || !endTime) {
      res.status(400).json({
        success: false,
        message: 'All parameters are required',
      });
      return;
    }

    // Get hospital ObjectId
    const hospital = await findHospitalObjectId(hospitalId);

    const slotData: CreateSlotsData = {
      hospitalId,
      slotDuration,
      maxCapacity,
      startDate,
      endDate,
      startTime,
      endTime,
    };

    const result = await createSlotsService(slotData, hospital._id);

    res.status(201).json({
      success: true,
      message: `Successfully created ${result.slotsCreated} slots`,
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'Hospital not found') {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    if (error.message.includes('exceed 30 days limit')) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({ success: false, message: 'Error creating slots', error: error.message });
  }
};

export const getSlotsByHospital = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hospitalId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Get hospital ObjectId
    const hospital = await findHospitalObjectId(hospitalId as string);

    const result = await getSlotsByHospitalService(hospital._id, { page, limit });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error: any) {
    if (error.message === 'Hospital not found') {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Error fetching slots', error: error.message });
  }
};

export const deleteSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slotId } = req.params;

    await deleteSlotService(slotId as string);

    res.status(200).json({
      success: true,
      message: 'Slot deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Invalid slot ID') {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    if (error.message === 'Slot not found') {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    if (error.message.includes('active booking')) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({ success: false, message: 'Error deleting slot', error: error.message });
  }
};

export const getSlotById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slotId } = req.params;

    const slot = await getSlotByIdService(slotId as string);

    res.status(200).json({
      success: true,
      data: slot,
    });
  } catch (error: any) {
    if (error.message === 'Invalid slot ID') {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    if (error.message === 'Slot not found') {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Error fetching slot', error: error.message });
  }
};

export const deleteSlotsByDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hospitalId } = req.params;
    const { date } = req.query;

    if (!hospitalId || !date) {
      res.status(400).json({ success: false, message: 'Hospital ID and date are required' });
      return;
    }

    const hospital = await findHospitalObjectId(hospitalId as string);
    const result = await deleteSlotsByDateService(hospital._id, date as string);

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} slots for ${date}`,
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'Hospital not found') {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    if (error.message === 'No slots found for the specified date') {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Error deleting slots', error: error.message });
  }
};

