import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import {
  login,
  logout,
  getAllUsers,
  createUser,
  updateUser,
  changeUserPassword,
  getUserById,
  getCurrentUser,
} from '../controllers/userController';

const router = Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================
// User login
router.post('/login', login);

// User logout
router.post('/logout', logout);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================
router.use(authMiddleware);

// Get current user (from JWT token)
router.get('/me', getCurrentUser);

// ============================================
// ADMIN ONLY ROUTES
// ============================================

// Get all users (paginated) - Admin only
router.get('/', requireRole(['admin']), getAllUsers);

// Create user - Admin only
router.post('/', requireRole(['admin']), createUser);

// Change user password - Admin only (must come before /:userId)
router.post('/:userId/change-password', requireRole(['admin']), changeUserPassword);

// Get user by ID - Admin only
router.get('/:userId', requireRole(['admin']), getUserById);

// Update user - Admin only
router.put('/:userId', requireRole(['admin']), updateUser);

// ============================================
// Add other user role routes here (doctor, receptionist, etc.)
// ============================================

export default router;

