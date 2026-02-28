import { Request, Response } from 'express';
import {
  getPatientById as getPatientByIdService,
  createPatient as createPatientService,
  listPatients as listPatientsService,
} from '../services/patientService';

export const getPatientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;

    const patient = await getPatientByIdService(patientId as string);

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error: any) {
    if (error.message === 'Patient not found') {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Error fetching patient', error: error.message });
  }
};

export const createPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientData = req.body;

    if (!patientData.name) {
      res.status(400).json({ success: false, message: 'Patient name is required' });
      return;
    }

    const patient = await createPatientService(patientData);

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: patient,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error creating patient', error: error.message });
  }
};

export const listPatients = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await listPatientsService(page, limit);

    res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error listing patients', error: error.message });
  }
};
