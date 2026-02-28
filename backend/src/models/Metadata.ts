import { Document, Schema, model } from "mongoose";

export interface MetadataDocument extends Document {
  treatments: string[];
  medicines: string[];
  diseases: string[];
  symptoms: string[];
  createdAt: Date;
  updatedAt: Date;
}

const metadataSchema = new Schema<MetadataDocument>(
  {
    treatments: [{ type: String }],
    medicines: [{ type: String }],
    diseases: [{ type: String }],
    symptoms: [{ type: String }],
  },
  { timestamps: true }
);

export const Metadata = model<MetadataDocument>("Metadata", metadataSchema);
