import { Document, Schema, Types, model } from "mongoose";

export interface SlotWindowDocument extends Document {
  hospitalId: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  slotDate: Date;
  slotNumber: number;
  maxCapacity: number;
  bookedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const slotWindowSchema = new Schema<SlotWindowDocument>(
  {
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    slotDate: { type: Date, required: true },
    slotNumber: { type: Number, required: true }, // this got added
    maxCapacity: { type: Number, required: true },
    bookedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SlotWindow = model<SlotWindowDocument>(
  "SlotWindow",
  slotWindowSchema
);
