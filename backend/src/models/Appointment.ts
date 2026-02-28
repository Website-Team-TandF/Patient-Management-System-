import { Document, Schema, Types, model } from "mongoose";
import { AppointmentMode, AppointmentStatus } from "../types";

export interface AppointmentDocument extends Document {
  appointmentId: string;
  name: string;
  email: string;
  phoneNo: string;
  healthIssue: string;
  hospitalId: Types.ObjectId;
  mode: AppointmentMode;
  status: AppointmentStatus;
  amountPaid?: number;
  appointmentDate: Date;
  doctorId: Types.ObjectId;
  doctorName: string;
  duration?: number;
  slotWindowId: Types.ObjectId;
  slotNumber: number;
  slotStartTime: Date;
  slotEndTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<AppointmentDocument>(
  {
    appointmentId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true }, // these got added
    email: { type: String, required: true }, // these got added
    phoneNo: { type: String, required: true }, // these got added
    mode: { type: String, enum: ["online", "offline"], required: true },
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    status: {
      type: String,
      enum: ["booked", "cancelled", "checked_in"],
      required: true,
    },
    healthIssue: {
      type: String,
    },
    amountPaid: { type: Number },
    // tokenNumber: { type: Number },                     // these got removed
    appointmentDate: { type: Date, required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User" },
    doctorName: { type: String },
    duration: { type: Number }, // Duration in minutes
    slotWindowId: {
      type: Schema.Types.ObjectId,
      ref: "SlotWindow",
      required: true,
    },
    slotNumber: { type: Number, required: true }, // this got added
    slotStartTime: { type: Date, required: true }, // this got added
    slotEndTime: { type: Date, required: true }, // this got added
  },
  { timestamps: true }
);

export const Appointment = model<AppointmentDocument>(
  "Appointment",
  appointmentSchema
);
