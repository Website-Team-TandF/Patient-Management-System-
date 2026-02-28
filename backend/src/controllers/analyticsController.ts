import { Request, Response } from 'express';
import { Visit } from '../models/Visit';

export const getHospitalVisitsAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const query: any = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const analytics = await Visit.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$hospitalId',
          visitCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'hospitals',
          localField: '_id',
          foreignField: '_id',
          as: 'hospitalInfo'
        }
      },
      { $unwind: '$hospitalInfo' },
      {
        $project: {
          _id: 0,
          hospitalId: '$_id',
          name: '$hospitalInfo.name',
          city: '$hospitalInfo.city',
          visitCount: 1
        }
      },
      { $sort: { visitCount: -1 } }
    ]);

    res.status(200).json({ success: true, data: analytics });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getDiseaseAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const query: any = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const analytics = await Visit.aggregate([
      { $match: query },
      { $unwind: '$disease' },
      {
        $group: {
          _id: '$disease',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          disease: '$_id',
          count: 1
        }
      }
    ]);

    res.status(200).json({ success: true, data: analytics });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTreatmentAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const query: any = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const analytics = await Visit.aggregate([
      { $match: query },
      { $unwind: { path: '$treatmentGiven', preserveNullAndEmptyArrays: false } }, // Ensure we only count if it exists
      {
        $group: {
          _id: '$treatmentGiven',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          treatment: '$_id',
          count: 1
        }
      }
    ]);

    res.status(200).json({ success: true, data: analytics });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
