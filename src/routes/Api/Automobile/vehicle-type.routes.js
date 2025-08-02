import express from 'express';
const router = express.Router();
import { 
  createVehicleType, 
  updateVehicleType, 
  getVehicleTypeById, 
  getAllVehicleTypes 
} from '../../../controller/vehicle-type.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create vehicle type (requires authentication) 2025-07-30
router.post('/', auth, createVehicleType);

// Update vehicle type (requires authentication) 2025-07-30
router.put('/', auth, updateVehicleType);

// Get vehicle type by ID (requires authentication) 2025-07-30
router.get('/:vehicletype_id', auth, getVehicleTypeById);

// Get all vehicle types (requires authentication) 2025-07-30
router.get('/', auth, getAllVehicleTypes);

export default router;