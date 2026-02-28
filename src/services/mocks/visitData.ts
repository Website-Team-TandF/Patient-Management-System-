import type { Patient } from "./patientData";

export interface Vitals {
  pulse?: number;
  bp?: string;
  temperature?: number;
}

export interface OtherProblems {
  acidity?: boolean;
  diabetes?: boolean;
  constipation?: boolean;
  amebiasis?: boolean;
  bp?: boolean;
  heartProblems?: boolean;
  other?: string;
}

export interface PrescribedMedicineItem {
  medicineId?: string;
  medicineName: string;
  quantity: number;
  dosage: string;
  timing?: string; // Legacy
  kala?: string;
  anupana?: string;
  instructions?: string;
  duration?: string;
}

export interface MedicalHistory {
  disease: string[];
  diseaseDuration?: string;
  presentSymptoms?: string[];
  previousTreatment?: string[];
  treatmentGiven?: string[];
  vitals?: Vitals;
  nadi?: {
    wrist: 'Left' | 'Right';
    gati?: string;
    bala?: string;
    tala?: string;
    temperature?: string;
  };
  ayurvedicBaseline?: {
    dosha: {
      vata: number;
      pitta: number;
      kapha: number;
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
  dosha?: { // Legacy
    vata: number;
    pitta: number;
    kapha: number;
    indication: 'Acute' | 'Chronic';
  };
  otherProblems?: OtherProblems;
  medicinesGiven?: string[];
  prescribedMedicines?: PrescribedMedicineItem[];
  medicineGiven?: boolean;
  givenMedicines?: PrescribedMedicineItem[];
  advice?: string;
  followUpDate?: string;
}

export interface Visit {
  id: string;
  tokenNumber: number;
  patientId: string;
  patientName: string;
  phoneNumber: string;
  sex: 'Male' | 'Female' | 'Other';
  dob: string;
  address: string;
  visitDate: string;
  patient: Patient;
  visitTime: string;
  status: 'waiting' | 'done';
  hospitalId: string;
  appointmentId?: string;
  isOfflineAppointment?: boolean;
  medicalHistory?: MedicalHistory;
  // New structured medicine fields
  disease?: string[];
  prescribedMedicines?: PrescribedMedicineItem[];
  medicinesGiven?: string[];
  pharmacistNotes?: string;
  dispensedAt?: string;
  medicineGiven?: boolean;
  givenMedicines?: PrescribedMedicineItem[];
}

export const mockVisits: Visit[] = []
