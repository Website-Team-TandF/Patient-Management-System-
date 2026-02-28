import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  name: string;
  email: string;
  phoneNumber: string;
  city: string;
  healthIssue: string;
  isConverted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    city: { type: String, required: true },
    healthIssue: { type: String, required: true },
    isConverted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<ILead>('Lead', leadSchema);
