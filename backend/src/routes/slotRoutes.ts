import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import {
  createSlots,
  getSlotsByHospital,
  deleteSlot,
  getSlotById,
  deleteSlotsByDate,
} from '../controllers/slotController';

const router = Router();

// ============================================
// ADMIN ONLY ROUTES
// ============================================
router.use(authMiddleware);

// Create slots for a hospital - Admin only
router.post('/', requireRole(['admin']), createSlots);

// Get slots by hospital (paginated) - Admin only (must come before /:slotId)
router.get('/hospital/:hospitalId', requireRole(['admin']), getSlotsByHospital);

// Get slot by ID - Admin only
router.get('/:slotId', requireRole(['admin']), getSlotById);

// Delete slot - Admin only
router.delete('/:slotId', requireRole(['admin']), deleteSlot);

// Bulk delete slots by date - Admin only
router.delete('/hospital/:hospitalId', requireRole(['admin']), deleteSlotsByDate);

// ============================================
// Add other user role routes here (doctor, receptionist, etc.)
// ============================================

export default router;

