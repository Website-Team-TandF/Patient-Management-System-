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

// Get available slots for a hospital
router.get('/slots/:hospitalId', getPublicSlots);

// Get next N calendar days with slots (default 7), skipping empty days
router.get('/slots/window/:hospitalId', getNextSlotWindow);

// Lock a slot when proceeding to payment
router.post('/slots/lock', lockSlot);

// Release a slot lock (when user cancels payment)
router.delete('/slots/lock/:lockId', releaseSlotLock);

// Confirm booking after payment
router.post('/confirm', confirmBooking);

export default router;
