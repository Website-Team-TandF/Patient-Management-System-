import { Router } from "express";
import { getMetadata, updateMetadata } from "../controllers/metadataController";
import { protect, restrictTo } from "../middlewares/authMiddleware";

const router = Router();

// Publicly available for doctor form selectors
router.get("/", getMetadata);

// Only admin can update metadata
router.patch("/", protect, restrictTo("ADMIN"), updateMetadata);

export default router;
