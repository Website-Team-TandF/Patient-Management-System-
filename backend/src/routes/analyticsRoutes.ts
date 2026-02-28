import express from "express";
import {
  getHospitalVisitsAnalytics,
  getDiseaseAnalytics,
  getTreatmentAnalytics,
} from "../controllers/analyticsController";
import { protect, restrictTo } from "../middlewares/authMiddleware";

const router = express.Router();

// Only Super Admins can access analytics
router.use(protect, restrictTo("ADMIN"));

router.get("/hospitals", getHospitalVisitsAnalytics);
router.get("/diseases", getDiseaseAnalytics);
router.get("/treatments", getTreatmentAnalytics);

export default router;
