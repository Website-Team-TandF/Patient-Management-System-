import { Patient, PatientDocument } from '../models/Patient';
import { Types } from 'mongoose';

export interface CreatePatientData {
  name: string;
  email?: string;
  phoneNo?: string;
  sex?: 'male' | 'female' | 'other';
  dob?: Date;
  referralSource?: string;
  address?: {
    city?: string;
    state?: string;
    street?: string;
  };
}

/**
 * Generate a unique patient ID: 3 uppercase letters + 7 digits
 * Same format as appointmentId for consistency
 */
const generatePatientId = (): string => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetters = Array(3)
    .fill(null)
    .map(() => letters.charAt(Math.floor(Math.random() * letters.length)))
    .join('');
  const randomDigits = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, '0');
  return `${randomLetters}${randomDigits}`;
};

export const getPatientById = async (id: string): Promise<PatientDocument> => {
  // First try to find by patientId (custom ID)
  let patient = await Patient.findOne({ patientId: id }).select('-__v') as PatientDocument | null;
  
  // Fallback to MongoDB ObjectId for backward compatibility
  if (!patient && Types.ObjectId.isValid(id)) {
    patient = await Patient.findById(id).select('-__v') as PatientDocument | null;
  }
  
  if (!patient) {
    throw new Error('Patient not found');
  }
  return patient;
};

export const createPatient = async (patientData: CreatePatientData) => {
  const maxRetries = 3;
  let retries = maxRetries;
  let saved = false;
  let patient: PatientDocument | undefined;

  while (retries > 0 && !saved) {
    try {
      const patientId = generatePatientId();
      
      patient = new Patient({
        patientId,
        ...patientData
      }) as PatientDocument;

      await patient.save();
      saved = true;
    } catch (err: any) {
      // Check for duplicate key error (code 11000)
      if (err.code === 11000 && retries > 1) {
        console.warn(`Duplicate patient ID generated, retrying... (${retries - 1} retries left)`);
        retries--;
        continue;
      }
      // If other error or no retries left, throw
      throw err;
    }
  }

  if (!patient) {
    throw new Error('Failed to create patient after retries');
  }

  return patient as PatientDocument;
};

export const listPatients = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  
  const patients = await Patient.find({})
    .skip(skip)
    .limit(limit)
    .select('-__v') as PatientDocument[];

  const total = await Patient.countDocuments({});

  // Add totalVisits for each patient (status 'done')
  const patientsWithVisits = await Promise.all(patients.map(async (p) => {
    const { countPatientDoneVisits } = await import('./visitService');
    const totalVisits = await countPatientDoneVisits(p._id.toString());
    return {
      ...p.toObject(),
      totalVisits
    };
  }));

  return {
    data: patientsWithVisits,
    total,
    page,
    limit
  };
};

export const searchPatientsByPhone = async (phoneNo: string): Promise<PatientDocument[]> => {
  const patients = await Patient.find({ 
    phoneNo: { $regex: phoneNo, $options: 'i' } 
  })
    .limit(10)
    .select('-__v') as PatientDocument[];
  
  return patients;
};
