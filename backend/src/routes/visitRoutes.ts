import { Router } from "express";
import {
  createVisit,
  searchVisitByToken,
  getHospitalTodayVisits,
  updateVisitDetails,
  getPatientHistory,
  createOfflineVisit,
  getVisitSlipByToken,
  getVisitSlipById,
} from "../controllers/visitController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";

const router = Router();

// Universal Check-in access (Receptionist/Admin)
router.post(
  "/",
  authMiddleware,
  requireRole(["receptionist", "admin"]),
  createVisit
);

// Offline visit creation (walk-in without appointment)
router.post(
  "/offline",
  authMiddleware,
  requireRole(["receptionist", "admin"]),
  createOfflineVisit
);

// Doctor Dashboard features
router.get(
  "/search",
  authMiddleware,
  requireRole(["doctor", "admin"]),
  searchVisitByToken
);
router.get(
  "/today",
  authMiddleware,
  requireRole(["doctor", "admin"]),
  getHospitalTodayVisits
);
router.put(
  "/:visitId",
  authMiddleware,
  requireRole(["doctor", "admin"]),
  updateVisitDetails
);
router.get(
  "/patient/:patientId/history",
  authMiddleware,
  requireRole(["doctor", "admin"]),
  getPatientHistory
);

// Slip endpoints - accessible by receptionist and doctor
router.get(
  "/slip",
  authMiddleware,
  requireRole(["receptionist", "doctor", "admin"]),
  getVisitSlipByToken
);

router.get(
  "/slip/:visitId",
  authMiddleware,
  requireRole(["receptionist", "doctor", "admin"]),
  getVisitSlipById
);

export default router;
