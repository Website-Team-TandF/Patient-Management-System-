import express from 'express';
import { createLead, getLead, updateLeadStatus, getUnconvertedLeads } from '../controllers/leadController';

const router = express.Router();

router.post('/', createLead);
router.get('/analysis/unconverted', getUnconvertedLeads);
router.get('/:id', getLead);
router.patch('/:id/status', updateLeadStatus);

export default router;
