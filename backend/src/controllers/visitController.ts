import { Request, Response } from 'express';
import {
  createVisit as createVisitService,
  createOfflineVisit as createOfflineVisitService,
  searchVisitByTokenToday,
  getTodayVisitsForHospital,
  updateVisitMedicalDetails,
  getPatientVisitsHistory,
  getVisitForSlip,
  getVisitByIdForSlip,
} from '../services/visitService';

export const createVisit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { appointmentId, patientId } = req.body;

    if (!appointmentId || !patientId) {
      res.status(400).json({ success: false, message: 'Appointment ID and Patient ID are required' });
      return;
    }

    const visit = await createVisitService(appointmentId, patientId);

    res.status(201).json({
      success: true,
      message: 'Visit created successfully',
      data: visit,
    });
  } catch (error: any) {
    if (error.message === 'Appointment not found' || error.message === 'Patient not found') {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Error creating visit', error: error.message });
  }
};

export const createOfflineVisit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, hospitalId, doctorId } = req.body;

    if (!patientId || !hospitalId) {
      res.status(400).json({ success: false, message: 'Patient ID and Hospital ID are required' });
      return;
    }

    const visit = await createOfflineVisitService(patientId, hospitalId, doctorId);

    res.status(201).json({
      success: true,
      message: 'Offline visit created successfully',
      data: visit,
    });
  } catch (error: any) {
    if (error.message === 'Patient not found') {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Error creating offline visit', error: error.message });
  }
};

export const searchVisitByToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tokenNumber, hospitalId } = req.query;

    if (!tokenNumber || !hospitalId) {
      res.status(400).json({ success: false, message: 'Token number and Hospital ID are required' });
      return;
    }

    const visit = await searchVisitByTokenToday(parseInt(tokenNumber as string), hospitalId as string);

    if (!visit) {
      res.status(404).json({ success: false, message: 'Visit not found for today' });
      return;
    }

    res.status(200).json({
      success: true,
      data: visit,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error searching visit', error: error.message });
  }
};

export const getHospitalTodayVisits = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hospitalId } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!hospitalId) {
      res.status(400).json({ success: false, message: 'Hospital ID is required' });
      return;
    }

    const result = await getTodayVisitsForHospital(hospitalId as string, page, limit);

    res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching visits', error: error.message });
  }
};

export const updateVisitDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { visitId } = req.params;
    const medicalDetails = req.body;

    const visit = await updateVisitMedicalDetails(visitId as string, medicalDetails);

    res.status(200).json({
      success: true,
      message: 'Visit details updated successfully',
      data: visit,
    });
  } catch (error: any) {
    if (error.message === 'Visit not found') {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Error updating visit details', error: error.message });
  }
};

export const getPatientHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;

    const history = await getPatientVisitsHistory(patientId as string);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching patient history', error: error.message });
  }
};

export const getVisitSlipByToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tokenNumber, hospitalId } = req.query;

    if (!tokenNumber || !hospitalId) {
      res.status(400).json({ success: false, message: 'Token number and Hospital ID are required' });
      return;
    }

    const visit = await getVisitForSlip(parseInt(tokenNumber as string), hospitalId as string);

    if (!visit) {
      res.status(404).json({ success: false, message: 'Visit not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: visit,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching visit slip', error: error.message });
  }
};

export const getVisitSlipById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { visitId } = req.params;

    const visit = await getVisitByIdForSlip(visitId as string);

    if (!visit) {
      res.status(404).json({ success: false, message: 'Visit not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: visit,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching visit slip', error: error.message });
  }
};
