import { Router } from 'express';
import {
  getPublicSlots,
  getNextSlotWindow,
  lockSlot,
  releaseSlotLock,
  confirmBooking,
} from '../controllers/bookingController';

const router = Router();

// ============================================
// PUBLIC BOOKING ROUTES (No Auth Required)
// ============================================

// Get the next N calendar days with slots — MUST be before /slots/:hospitalId
router.get('/slots/window/:hospitalId', getNextSlotWindow);

// Get available slots for a hospital on a given date
router.get('/slots/:hospitalId', getPublicSlots);

// Lock a slot when proceeding to payment
router.post('/slots/lock', lockSlot);

// Release a slot lock (when user cancels payment)
router.delete('/slots/lock/:lockId', releaseSlotLock);

// Confirm booking after payment
router.post('/confirm', confirmBooking);

export default router;
