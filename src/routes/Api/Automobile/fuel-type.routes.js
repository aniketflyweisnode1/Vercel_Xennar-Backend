import express from 'express';
const router = express.Router();
import { 
  createFuelType, 
  updateFuelType, 
  getFuelTypeById, 
  getAllFuelTypes 
} from '../../../controller/fuel-type.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create fuel type (requires authentication) 2025-07-30
router.post('/', auth, createFuelType);

// Update fuel type (requires authentication) 2025-07-30
router.put('/', auth, updateFuelType);

// Get fuel type by ID (requires authentication) 2025-07-30
router.get('/:fuelType_id', auth, getFuelTypeById);

// Get all fuel types (requires authentication) 2025-07-30
router.get('/', auth, getAllFuelTypes);

export default router;