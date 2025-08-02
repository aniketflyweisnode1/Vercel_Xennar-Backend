import express from 'express';
const router = express.Router();
import { 
  createPayment, 
  updatePayment, 
  getPaymentById, 
  getAllPayments
} from '../../../controller/payment.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create payment (requires authentication) 2025-07-31
router.post('/', auth, createPayment);

// Update payment (requires authentication) 2025-07-31
router.put('/', auth, updatePayment);

// Get payment by ID (requires authentication) 2025-07-31
router.get('/:payment_id', auth, getPaymentById);

// Get all payments (requires authentication) 2025-07-31
router.get('/', auth, getAllPayments);

export default router; 