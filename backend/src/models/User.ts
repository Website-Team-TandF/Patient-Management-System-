import { Document, Schema, model } from 'mongoose';
import { UserRole } from '../types';

export interface UserDocument extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  departments: string[];
  specializations: string[];
  extraLine?: string;
  userRoles: UserRole[];
  consultationFee?: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true },
    departments: [{ type: String }],
    specializations: [{ type: String }],
    extraLine: { type: String },
    userRoles: {
      type: [{ type: String, enum: ['admin', 'doctor', 'receptionist'] }],
      default: [],
    },
    consultationFee: { type: Number },
  },
  { timestamps: true }
);

export const User = model<UserDocument>('User', userSchema);
