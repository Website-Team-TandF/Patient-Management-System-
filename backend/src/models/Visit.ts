import { Document, Schema, Types, model } from "mongoose";
import { VisitStatus } from "../types";

// Single medicine item as prescribed by doctor
export interface PrescribedMedicineItem {
  medicineName: string;
  quantity: number;
  dosage: string; // e.g., "OD", "BD", "1-0-1"
  instructions?: string; // e.g., "with lukewarm water"
  timing?: string; // Legacy field
  kala?: string; // "Before", "After", "Morning", "Night"
  anupana?: string; // "Warm Water", "Milk", "Honey", "Ghee"
  duration?: string;
}



export interface VisitDocument extends Document {
  visitToken: number;
  patientId: Types.ObjectId;
  hospitalId: Types.ObjectId;
  appointmentId?: string;
  doctorId: Types.ObjectId;
  status: VisitStatus;
  isOfflineAppointment: boolean;
  
  // Doctor's examination fields
  disease: string[];
  diseaseDuration?: string;
  presentSymptoms?: string[];
  previousTreatment?: string[];
  treatmentGiven?: string[];
  vitals?: {
    pulse?: number;
    bp?: string;
    temperature?: number;
  };
  
  // Ayurvedic Specifics
  nadi?: {
    wrist: 'Left' | 'Right';
    gati?: string;
    bala?: string;
    tala?: string;
    temperature?: string;
  };

  ayurvedicBaseline?: {
    dosha: {
      vata: number; // 0-100
      pitta: number; // 0-100
      kapha: number; // 0-100
      indication: 'Acute' | 'Chronic';
      dominant: string;
    };
    agni: string;
    amaStatus: string;
    dailyHabits: {
      sleep: string;
      appetite: string;
      bowel: string;
    };
  };

  dosha?: { // Deprecated - replaced by ayurvedicBaseline.dosha
    vata: number;
    pitta: number;
    kapha: number;
    indication: 'Acute' | 'Chronic';
  };

  otherProblems?: {
    acidity?: boolean;
    diabetes?: boolean;
    constipation?: boolean;
    amebiasis?: boolean;
    bp?: boolean;
    heartProblems?: boolean;
    other?: string;
  };
  
  // Doctor's prescription - structured medicine data
  prescribedMedicines?: PrescribedMedicineItem[];
  
  // Legacy field for simple medicine names (backward compatibility)
  medicinesGiven?: string[];
  

  
  advice?: string;
  followUpDate?: string;
  medicineGiven: boolean;
  givenMedicines?: PrescribedMedicineItem[];
  createdAt: Date;
  updatedAt: Date;
}

const prescribedMedicineSchema = new Schema({
  medicineId: { type: Schema.Types.ObjectId, ref: "Medicine", required: true  }, // Link to medicine inventory
  medicineName: { type: String, required: true },
  quantity: { type: Number, required: true },
  dosage: { type: String },
  instructions: { type: String },
  timing: { type: String },
  kala: { type: String },
  anupana: { type: String },
  duration: { type: String },
}, { _id: false });



const visitSchema = new Schema<VisitDocument>(
  {
    visitToken: { type: Number, required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },
    appointmentId: { type: String },
    doctorId: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["waiting", "done"], required: true },
    isOfflineAppointment: { type: Boolean, default: false },
    
    disease: [{ type: String }],
    diseaseDuration: { type: String },
    presentSymptoms: [{ type: String }],
    previousTreatment: [{ type: String }],
    treatmentGiven: [{ type: String }],
    vitals: {
      pulse: { type: Number },
      bp: { type: String },
      temperature: { type: Number },
    },
    
    nadi: {
      wrist: { type: String, enum: ['Left', 'Right'] },
      gati: { type: String },
      bala: { type: String },
      tala: { type: String },
      temperature: { type: String },
    },

    ayurvedicBaseline: {
      dosha: {
        vata: { type: Number, min: 0, max: 100 },
        pitta: { type: Number, min: 0, max: 100 },
        kapha: { type: Number, min: 0, max: 100 },
        indication: { type: String, enum: ['Acute', 'Chronic'] },
        dominant: { type: String },
      },
      agni: { type: String },
      amaStatus: { type: String },
      dailyHabits: {
        sleep: { type: String },
        appetite: { type: String },
        bowel: { type: String },
      },
    },

    dosha: {
      vata: { type: Number, min: 0, max: 100 },
      pitta: { type: Number, min: 0, max: 100 },
      kapha: { type: Number, min: 0, max: 100 },
      indication: { type: String, enum: ['Acute', 'Chronic'] },
    },

    otherProblems: {
      acidity: { type: Boolean },
      diabetes: { type: Boolean },
      constipation: { type: Boolean },
      amebiasis: { type: Boolean },
      bp: { type: Boolean },
      heartProblems: { type: Boolean },
      other: { type: String },
    },
    
    // Structured prescription
    prescribedMedicines: [prescribedMedicineSchema],
    
    // Pharmacist fields
    medicineGiven: { type: Boolean, default: false },
    givenMedicines: [prescribedMedicineSchema],
    
    // Legacy simple list
    medicinesGiven: [{ type: String }],
    
    advice: { type: String },
    followUpDate: { type: String },
  },
  { timestamps: true }
);

// Compound index for searching visits by token and hospital on a specific date
visitSchema.index({ visitToken: 1, hospitalId: 1, createdAt: 1 });

export const Visit = model<VisitDocument>("Visit", visitSchema);
