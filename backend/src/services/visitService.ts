import { Visit, VisitDocument } from '../models/Visit';
import { Token } from '../models/Token';
import { getAppointmentByPublicId } from './appointmentService';
import { getPatientById } from './patientService';
import { Types } from 'mongoose';

/**
 * Atomic token generation for a hospital on a specific date
 */
export const getNextToken = async (hospitalId: Types.ObjectId, date: Date): Promise<number> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const tokenRecord = await Token.findOneAndUpdate(
    { hospitalId, date: startOfDay },
    { $inc: { currentToken: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return tokenRecord.currentToken;
};

export const createVisit = async (appointmentId: string, patientId: string) => {
  const appointment = await getAppointmentByPublicId(appointmentId);
  const patient = await getPatientById(patientId);

  // Get hospitalId from appointment (it's a ref to Hospital)
  const hospitalId = appointment.hospitalId;

  // Get next token atomically for this hospital and today
  const visitToken = await getNextToken(hospitalId as Types.ObjectId, new Date());

  const visit = new Visit({
    visitToken,
    patientId: patient._id,
    hospitalId,
    appointmentId,
    doctorId: appointment.doctorId,
    status: 'waiting',
    isOfflineAppointment: false,
    disease: [], // Initialize empty, doctor will fill
  });

  await visit.save();
  return visit;
};

/**
 * Create an offline visit (walk-in patient without appointment)
 */
export const createOfflineVisit = async (
  patientId: string,
  hospitalId: string,
  doctorId?: string
) => {
  const patient = await getPatientById(patientId);

  if (!Types.ObjectId.isValid(hospitalId)) {
    throw new Error('Invalid hospital ID');
  }

  const hospitalObjectId = new Types.ObjectId(hospitalId);

  // Get next token atomically for this hospital and today
  const visitToken = await getNextToken(hospitalObjectId, new Date());

  const visit = new Visit({
    visitToken,
    patientId: patient._id,
    hospitalId: hospitalObjectId,
    doctorId: doctorId ? new Types.ObjectId(doctorId) : undefined,
    status: 'waiting',
    isOfflineAppointment: true,
    disease: [],
  });

  await visit.save();
  return visit;
};

export const searchVisitByTokenToday = async (tokenNumber: number, hospitalId: string) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  console.log(startOfDay,'startd')
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const visits = await Visit.aggregate([
    {
      $match: {
        visitToken: tokenNumber,
        hospitalId: new Types.ObjectId(hospitalId),
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $lookup: {
        from: 'patients',
        localField: 'patientId',
        foreignField: '_id',
        as: 'patient'
      }
    },
    {
      $unwind: '$patient'
    },
    {
      $project: {
        __v: 0,
        'patient.__v': 0
      }
    }
  ]);

  return visits[0] || null;
};

export const getTodayVisitsForHospital = async (
  hospitalId: string, 
  page: number = 1, 
  limit: number = 10
) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const skip = (page - 1) * limit;

  const visits = await Visit.aggregate([
    {
      $match: {
        hospitalId: new Types.ObjectId(hospitalId),
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $lookup: {
        from: 'patients',
        localField: 'patientId',
        foreignField: '_id',
        as: 'patient'
      }
    },
    {
      $unwind: '$patient'
    },
    { $sort: { visitToken: 1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        visitToken: 1,
        status: 1,
        createdAt: 1,
        patientId: 1,
        'patient._id': 1,
        'patient.name': 1,
        'patient.phoneNo': 1,
        'patient.sex': 1,
        'patient.dob': 1,
      }
    }
  ]);

  const total = await Visit.countDocuments({
    hospitalId: new Types.ObjectId(hospitalId),
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });

  return {
    data: visits,
    total,
    page,
    limit
  };
};

/**
 * Sanitize medical details by converting empty strings to undefined
 * This prevents Enum validation errors when empty values are sent from frontend
 */
const sanitizeMedicalDetails = (details: any) => {
  const sanitized = { ...details };
  
  // Clean top-level fields
  if (sanitized.diseaseDuration === '') sanitized.diseaseDuration = undefined;

  // Clean Nadi fields
  if (sanitized.nadi) {
    if (sanitized.nadi.wrist === '') sanitized.nadi.wrist = undefined;
    if (sanitized.nadi.gati === '') sanitized.nadi.gati = undefined;
    if (sanitized.nadi.bala === '') sanitized.nadi.bala = undefined;
    if (sanitized.nadi.tala === '') sanitized.nadi.tala = undefined;
    if (sanitized.nadi.temperature === '') sanitized.nadi.temperature = undefined;
  }

  // Clean Ayurvedic Baseline
  if (sanitized.ayurvedicBaseline) {
    if (sanitized.ayurvedicBaseline.agni === '') sanitized.ayurvedicBaseline.agni = undefined;
    if (sanitized.ayurvedicBaseline.amaStatus === '') sanitized.ayurvedicBaseline.amaStatus = undefined;
    
    if (sanitized.ayurvedicBaseline.dosha) {
        if (sanitized.ayurvedicBaseline.dosha.indication === '') sanitized.ayurvedicBaseline.dosha.indication = undefined;
        if (sanitized.ayurvedicBaseline.dosha.dominant === '') sanitized.ayurvedicBaseline.dosha.dominant = undefined;
    }

    if (sanitized.ayurvedicBaseline.dailyHabits) {
        if (sanitized.ayurvedicBaseline.dailyHabits.sleep === '') sanitized.ayurvedicBaseline.dailyHabits.sleep = undefined;
        if (sanitized.ayurvedicBaseline.dailyHabits.appetite === '') sanitized.ayurvedicBaseline.dailyHabits.appetite = undefined;
        if (sanitized.ayurvedicBaseline.dailyHabits.bowel === '') sanitized.ayurvedicBaseline.dailyHabits.bowel = undefined;
    }
  }

  return sanitized;
};

export const updateVisitMedicalDetails = async (visitId: string, medicalDetails: any): Promise<VisitDocument> => {
  const visit = await Visit.findById(visitId);
  
  if (!visit) {
    throw new Error('Visit not found');
  }

  const sanitized = sanitizeMedicalDetails(medicalDetails);

  // Apply updates
  Object.assign(visit, sanitized);
  
  // Force status to done
  visit.status = 'done';

  await visit.save();

  return visit;
};

export const getPatientVisitsHistory = async (patientId: string): Promise<VisitDocument[]> => {
  if (!Types.ObjectId.isValid(patientId)) {
    throw new Error('Invalid patient ID');
  }
  const visits = await Visit.find({
    patientId: new Types.ObjectId(patientId),
    status: 'done'
  })
    .sort({ createdAt: -1 })
    .select('-__v') as VisitDocument[];

  return visits;
};

export const countPatientDoneVisits = async (patientId: string) => {
  if (!Types.ObjectId.isValid(patientId)) {
    return 0;
  }
  return Visit.countDocuments({
    patientId: new Types.ObjectId(patientId),
    status: 'done'
  });
};

/**
 * Get visit details for slip (includes all information based on current state)
 */
export const getVisitForSlip = async (tokenNumber: number, hospitalId: string) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const visits = await Visit.aggregate([
    {
      $match: {
        visitToken: tokenNumber,
        hospitalId: new Types.ObjectId(hospitalId),
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $lookup: {
        from: 'patients',
        localField: 'patientId',
        foreignField: '_id',
        as: 'patient'
      }
    },
    {
      $unwind: '$patient'
    },
    {
      $lookup: {
        from: 'hospitals',
        localField: 'hospitalId',
        foreignField: '_id',
        as: 'hospital'
      }
    },
    {
      $unwind: '$hospital'
    },
    {
      $lookup: {
        from: 'users',
        localField: 'doctorId',
        foreignField: '_id',
        as: 'doctor'
      }
    },
    {
      $unwind: {
        path: '$doctor',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        __v: 0,
        'patient.__v': 0,
        'hospital.__v': 0,
        'doctor.__v': 0,
        'doctor.passwordHash': 0
      }
    }
  ]);

  return visits[0] || null;
};

/**
 * Get visit by ID with full details for slip
 */
export const getVisitByIdForSlip = async (visitId: string) => {
  if (!Types.ObjectId.isValid(visitId)) {
    throw new Error('Invalid visit ID');
  }

  const visits = await Visit.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(visitId)
      }
    },
    {
      $lookup: {
        from: 'patients',
        localField: 'patientId',
        foreignField: '_id',
        as: 'patient'
      }
    },
    {
      $unwind: '$patient'
    },
    {
      $lookup: {
        from: 'hospitals',
        localField: 'hospitalId',
        foreignField: '_id',
        as: 'hospital'
      }
    },
    {
      $unwind: '$hospital'
    },
    {
      $lookup: {
        from: 'users',
        localField: 'doctorId',
        foreignField: '_id',
        as: 'doctor'
      }
    },
    {
      $unwind: {
        path: '$doctor',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        __v: 0,
        'patient.__v': 0,
        'hospital.__v': 0,
        'doctor.__v': 0,
        'doctor.passwordHash': 0
      }
    }
  ]);

  return visits[0] || null;
};
