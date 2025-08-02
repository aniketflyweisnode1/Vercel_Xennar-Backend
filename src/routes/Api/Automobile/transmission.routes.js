import express from 'express';
const router = express.Router();
import { 
  createTransmission, 
  updateTransmission, 
  getTransmissionById, 
  getAllTransmissions 
} from '../../../controller/transmission.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create transmission (requires authentication) 2025-07-30
router.post('/', auth, createTransmission);

// Update transmission (requires authentication) 2025-07-30
router.put('/', auth, updateTransmission);

// Get transmission by ID (requires authentication) 2025-07-30
router.get('/:transmission_id', auth, getTransmissionById);

// Get all transmissions (requires authentication) 2025-07-30
router.get('/', auth, getAllTransmissions);

export default router;