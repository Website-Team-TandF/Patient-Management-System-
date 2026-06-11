import { Router } from "express";
import {
  getTodaysAppointments,
  getAppointmentById,
  checkInAppointment,
  getAdminAppointments,
  getAdminAppointmentAnalysis,
  getAppointmentsByRange,
} from "../controllers/appointmentController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";

const router = Router();

// Receptionist and Admin access
router.get(
  "/today",
  authMiddleware,
  requireRole(["receptionist", "admin"]),
  getTodaysAppointments
);
// Date-range appointments — receptionist weekly/monthly/custom view
// NOTE: must be placed BEFORE /:appointmentId to avoid Express matching 'range' as an ID
router.get(
  "/range",
  authMiddleware,
  requireRole(["receptionist", "admin"]),
  getAppointmentsByRange
);
router.get(
  "/:appointmentId",
  authMiddleware,
  requireRole(["receptionist", "admin"]),
  getAppointmentById
);
router.patch(
  "/:appointmentId/check-in",
  authMiddleware,
  requireRole(["receptionist", "admin"]),
  checkInAppointment
);

// Admin only access
router.get(
  "/admin/all",
  authMiddleware,
  requireRole(["admin"]),
  getAdminAppointments
);

router.get(
  "/admin/analysis",
  authMiddleware,
  requireRole(["admin"]),
  getAdminAppointmentAnalysis
);

export default router;
