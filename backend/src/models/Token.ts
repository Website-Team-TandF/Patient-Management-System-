import { Document, Schema, Types, model } from "mongoose";

export interface TokenDocument extends Document {
  hospitalId: Types.ObjectId;
  date: Date;
  currentToken: number;
}

const tokenSchema = new Schema<TokenDocument>(
  {
    hospitalId: { type: Schema.Types.ObjectId, required: true, index: true },
    date: { type: Date, required: true },
    currentToken: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export const Token = model<TokenDocument>("Token", tokenSchema);
