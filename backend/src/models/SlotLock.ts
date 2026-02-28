import { Document, Schema, Types, model } from 'mongoose';

export interface SlotLockDocument extends Document {
  slotWindowId: Types.ObjectId;
  bookingAttemptId: string;
  isBooked: boolean;
  expiresAt: Date;
  createdAt: Date;
}

const slotLockSchema = new Schema<SlotLockDocument>(
  {
    slotWindowId: { type: Schema.Types.ObjectId, ref: 'SlotWindow', required: true, index: true },
    bookingAttemptId: { type: String, required: true, unique: true },
    isBooked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

slotLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 600 });

export const SlotLock = model<SlotLockDocument>('SlotLock', slotLockSchema);
