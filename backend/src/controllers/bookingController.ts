import { Request, Response } from 'express';
import {
  getPublicSlots as getPublicSlotsService,
  getNextSlotWindow as getNextSlotWindowService,
  createSlotLock as createSlotLockService,
  releaseSlotLock as releaseSlotLockService,
  confirmBooking as confirmBookingService,
  ConfirmBookingData,
} from '../services/bookingService';

/**
 * Get available slots for a hospital (public endpoint)
 */
export const getPublicSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hospitalId } = req.params;
    const { date } = req.query;

    if (!hospitalId) {
      res.status(400).json({ success: false, message: 'Hospital ID is required' });
      return;
    }

    const slots = await getPublicSlotsService(hospitalId as string, date as string);

    res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (error: any) {
    if (error.message === 'Invalid hospital ID') {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Error fetching slots', error: error.message });
  }
};

/**
 * Get the next N calendar days that have at least one slot (public endpoint)
 * Returns an array of { date: 'YYYY-MM-DD', slots: PublicSlot[] } in ascending date order.
 */
export const getNextSlotWindow = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hospitalId } = req.params;
    const { from, days } = req.query;

    if (!hospitalId) {
      res.status(400).json({ success: false, message: 'Hospital ID is required' });
      return;
    }

    const fromDate = (from as string) || undefined;
    const daysNum = days ? parseInt(days as string, 10) || 7 : 7;

    const windowData = await getNextSlotWindowService(hospitalId as string, fromDate, daysNum);

    res.status(200).json({
      success: true,
      data: windowData,
    });
  } catch (error: any) {
    if (error.message === 'Invalid hospital ID') {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Error fetching slot window', error: error.message });
  }
};

/**
 * Lock a slot when user proceeds to payment
 */
export const lockSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slotId } = req.body;

    if (!slotId) {
      res.status(400).json({ success: false, message: 'Slot ID is required' });
      return;
    }

    const result = await createSlotLockService(slotId);

    res.status(201).json({
      success: true,
      message: 'Slot locked successfully',
      data: result,
    });
  } catch (error: any) {
    if (error.message.includes('no longer available') || error.message === 'Slot not found') {
      res.status(409).json({ success: false, message: error.message });
      return;
    }
    if (error.message === 'Invalid slot ID') {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Error locking slot', error: error.message });
  }
};

/**
 * Release a slot lock (when user cancels payment)
 */
export const releaseSlotLock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lockId } = req.params;

    if (!lockId) {
      res.status(400).json({ success: false, message: 'Lock ID is required' });
      return;
    }

    const result = await releaseSlotLockService(lockId as string);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    if (error.message === 'Lock not found') {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    if (error.message === 'Cannot release a confirmed booking') {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Error releasing lock', error: error.message });
  }
};

/**
 * Confirm booking after successful payment
 */
export const confirmBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lockId, leadId, doctorId, doctorName, duration, amount } = req.body;

    if (!lockId || !leadId) {
      res.status(400).json({ 
        success: false, 
        message: 'lockId and leadId are required' 
      });
      return;
    }

    const bookingData: ConfirmBookingData = {
      lockId,
      leadId,
      doctorId,
      doctorName,
      duration,
      amount,
    };

    const result = await confirmBookingService(bookingData);

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      data: result,
    });
  } catch (error: any) {
    if (error.message.includes('expired') || error.message === 'Lock not found or expired. Please try booking again.') {
      res.status(410).json({ success: false, message: error.message });
      return;
    }
    if (error.message === 'This booking has already been confirmed') {
      res.status(409).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Error confirming booking', error: error.message });
  }
};
