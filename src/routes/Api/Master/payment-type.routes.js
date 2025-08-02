import express from 'express';
const router = express.Router();
import { 
  createPaymentType, 
  updatePaymentType, 
  getPaymentTypeById, 
  getAllPaymentTypes
} from '../../../controller/payment-type.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create payment type (requires authentication) 2025-07-31
router.post('/', auth, createPaymentType);

// Update payment type (requires authentication) 2025-07-31
router.put('/', auth, updatePaymentType);

// Get payment type by ID (requires authentication) 2025-07-31
router.get('/:paymenttype_id', auth, getPaymentTypeById);

// Get all payment types (requires authentication) 2025-07-31
router.get('/', auth, getAllPaymentTypes);

export default router; 