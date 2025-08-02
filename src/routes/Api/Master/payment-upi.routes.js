import express from 'express';
const router = express.Router();
import { 
  createPaymentUPI, 
  updatePaymentUPI, 
  getPaymentUPIById, 
  getAllPaymentUPIs,
  getPaymentUPIsByAuth
} from '../../../controller/payment-upi.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create payment UPI (protected - requires authentication) 2025-08-02
router.post('/', auth, createPaymentUPI);

// Update payment UPI (protected - requires authentication) 2025-08-02
router.put('/', auth, updatePaymentUPI);

// Get all payment UPIs (public) 2025-08-02
router.get('/', getAllPaymentUPIs);

// Get payment UPI by ID (public) 2025-08-02
router.get('/:upi_id', getPaymentUPIById);

// Get payment UPIs by authenticated user (protected - requires authentication) 2025-08-02
router.get('/auth/my-upis', auth, getPaymentUPIsByAuth);

export default router; 