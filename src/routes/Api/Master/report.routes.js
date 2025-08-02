import express from 'express';
const router = express.Router();
import { 
  createReport, 
  updateReport, 
  getReportById, 
  getAllReports,
  getReportsByAuth
} from '../../../controller/report.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create report (protected - requires authentication) 2025-08-02
router.post('/', auth, createReport);

// Update report (protected - requires authentication) 2025-08-02
router.put('/', auth, updateReport);

// Get all reports (public) 2025-08-02
router.get('/', getAllReports);

// Get report by ID (public) 2025-08-02
router.get('/:report_id', getReportById);

// Get reports by authenticated user (protected - requires authentication) 2025-08-02
router.get('/auth/my-reports', auth, getReportsByAuth);

export default router; 