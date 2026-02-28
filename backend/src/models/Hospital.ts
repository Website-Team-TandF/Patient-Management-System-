import { Document, Schema, model } from 'mongoose';

export interface HospitalDocument extends Document {
  name: string;
  city: string;
  createdAt: Date;
  updatedAt: Date;
}

const hospitalSchema = new Schema<HospitalDocument>(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
  },
  { timestamps: true }
);

export const Hospital = model<HospitalDocument>('Hospital', hospitalSchema);
