import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes";
import hospitalRoutes from "./routes/hospitalRoutes";
import slotRoutes from "./routes/slotRoutes";
import patientRoutes from "./routes/patientRoutes";
import visitRoutes from "./routes/visitRoutes";

import appointmentRoutes from "./routes/appointmentRoutes";
import metadataRoutes from "./routes/metadataRoutes";
import leadRoutes from "./routes/leadRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import anylyticsRoutes from "./routes/analyticsRoutes";
import pharmacistRoutes from "./routes/pharmacistRoutes";
import { connectDB } from "./config/db";

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Global middlewares
app.use(
  cors({
    origin: true, // In production, replace with actual allowed origins
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Route mounting
app.use("/api/users", userRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/visits", visitRoutes);

app.use("/api/appointments", appointmentRoutes);
app.use("/api/metadata", metadataRoutes);
app.use("/api/public/booking", bookingRoutes); // Public booking routes (no auth)
app.use("/api/analytics", anylyticsRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/pharmacist", pharmacistRoutes);

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
