import express from 'express';
const router = express.Router();
import { 
  createVehicleTransactionType, 
  updateVehicleTransactionType, 
  getVehicleTransactionTypeById, 
  getAllVehicleTransactionTypes 
} from '../../../controller/vehicle-transaction-type.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create vehicle transaction type (requires authentication) 2025-07-30
router.post('/', auth, createVehicleTransactionType);

// Update vehicle transaction type (requires authentication) 2025-07-30
router.put('/', auth, updateVehicleTransactionType);

// Get vehicle transaction type by ID (requires authentication) 2025-07-30
router.get('/:vehicleTransactiontype_id', auth, getVehicleTransactionTypeById);

// Get all vehicle transaction types (requires authentication) 2025-07-30
router.get('/', auth, getAllVehicleTransactionTypes);

export default router;