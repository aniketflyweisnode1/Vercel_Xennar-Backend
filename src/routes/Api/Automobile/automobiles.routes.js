import express from 'express';
const router = express.Router();
import { 
  createAutomobile, 
  updateAutomobile, 
  getAutomobileById, 
  getAllAutomobiles,
  getAutomobilesByAuth,
  getDashboardHome,
  updateSoldStatus
} from '../../../controller/automobiles.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Dashboard Home API (requires authentication) 2025-07-31
router.get('/dashboard/home', auth, getDashboardHome);

// Create automobile (requires authentication) 2025-07-30
router.post('/', auth, createAutomobile);

// Update automobile (requires authentication) 2025-07-30
router.put('/', auth, updateAutomobile);

// Update automobile sold status (requires authentication) 2025-07-31
router.put('/sold-status', auth, updateSoldStatus);

// Get automobiles by authenticated user (requires authentication) 2025-07-30
router.get('/my-automobiles', auth, getAutomobilesByAuth);

// Get automobile by ID (requires authentication) 2025-07-30
router.get('/:Automobiles_id', auth, getAutomobileById);

// Get all automobiles (requires authentication) 2025-07-30
router.get('/', auth, getAllAutomobiles);

export default router; 