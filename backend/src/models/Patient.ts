import { Document, Schema, model } from 'mongoose';
import { Sex } from '../types';

export interface PatientDocument extends Document {
  patientId: string;
  name: string;
  email?: string;
  phoneNo?: string;
  sex?: Sex;
  dob?: Date;
  referralSource?: string;
  address?: {
    city?: string;
    state?: string;
    street?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<PatientDocument>(
  {
    patientId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String },
    phoneNo: { type: String },
    sex: { type: String, enum: ['male', 'female', 'other'] },
    dob: { type: Date },
    referralSource: { type: String },
    address: {
      city: { type: String },
      state: { type: String },
      street: { type: String },
    },
  },
  { timestamps: true }
);

export const Patient = model<PatientDocument>('Patient', patientSchema);
