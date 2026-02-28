import { Router } from "express";
import {
  getPatientById,
  createPatient,
  listPatients,
} from "../controllers/patientController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";

const router = Router();

// Receptionist and Admin access
router.get(
  "/:patientId",
  authMiddleware,
  requireRole(["receptionist", "admin"]),
  getPatientById
);
router.post(
  "/",
  authMiddleware,
  requireRole(["receptionist", "admin"]),
  createPatient
);
router.get("/", authMiddleware, requireRole(["doctor", "admin"]), listPatients);

export default router;
