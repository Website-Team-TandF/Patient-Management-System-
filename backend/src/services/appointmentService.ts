import { Appointment } from '../models/Appointment';
import { Types } from 'mongoose';
import { PaginationOptions, PaginatedResult } from './slotService';
import { getISTTodayStart } from '../utils/timeUtils';

export const getAdminAppointments = async (
  options: PaginationOptions
): Promise<PaginatedResult<any>> => {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const todayStartIST = getISTTodayStart();

  const query = {
    appointmentDate: { $gte: todayStartIST }
  };

  const appointments = await Appointment.find(query)
    .populate('hospitalId', 'name city')
    .sort({ appointmentDate: 1, slotStartTime: 1 })
    .skip(skip)
    .limit(limit)
    .select('-__v');

  const total = await Appointment.countDocuments(query);

  return {
    data: appointments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAdminAppointmentAnalysis = async () => {
  const todayStartIST = getISTTodayStart();

  const analysis = await Appointment.aggregate([
    {
      $match: {
        appointmentDate: { $gte: todayStartIST }
      }
    },
    {
      $group: {
        _id: {
          date: "$appointmentDate",
          hospitalId: "$hospitalId"
        },
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'hospitals',
        localField: '_id.hospitalId',
        foreignField: '_id',
        as: 'hospital'
      }
    },
    {
      $unwind: '$hospital'
    },
    {
      $project: {
        _id: 0,
        date: "$_id.date",
        hospitalName: "$hospital.name",
        hospitalCity: "$hospital.city",
        count: 1
      }
    },
    {
      $sort: { date: 1, hospitalName: 1 }
    }
  ]);

  return analysis;
};

export const getTodaysAppointments = async (
  hospitalObjectId: Types.ObjectId,
  options: PaginationOptions,
  mode?: string
): Promise<PaginatedResult<any>> => {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const query: any = {
    hospitalId: hospitalObjectId,
    appointmentDate: {
      $gte: todayStart,
      $lte: todayEnd
    }
  };

  if (mode) {
    query.mode = mode;
  }

  const appointments = await Appointment.find(query)
    .sort({ slotStartTime: 1 })
    .skip(skip)
    .limit(limit)
    .select('-__v');

  const total = await Appointment.countDocuments(query);

  return {
    data: appointments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAppointmentByPublicId = async (appointmentId: string) => {
  const appointment = await Appointment.findOne({ appointmentId })
    .select('-__v');
    
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  
  return appointment;
};

export const updateAppointmentStatus = async (appointmentId: string, status: 'checked_in' | 'cancelled') => {
  const appointment = await Appointment.findOneAndUpdate(
    { appointmentId },
    { status },
    { new: true }
  );

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  return appointment;
};

export const getAppointmentByObjectId = async (id: Types.ObjectId) => {
  const appointment = await Appointment.findById(id).select('-__v');
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  return appointment;
};
