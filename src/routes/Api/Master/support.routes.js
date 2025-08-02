import express from 'express';
const router = express.Router();
import { 
  createSupport, 
  updateSupport, 
  getSupportById, 
  getAllSupports,
  getSupportsByAskUserId,
  getSupportsByAnsById
} from '../../../controller/support.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create support ticket (protected - requires authentication) 2025-08-02
router.post('/', auth, createSupport);

// Update support ticket (protected - requires authentication) 2025-08-02
router.put('/', auth, updateSupport);

// Get all support tickets (public) 2025-08-02
router.get('/', getAllSupports);

// Get support ticket by ID (public) 2025-08-02
router.get('/:support_id', getSupportById);

// Get support tickets by ask user ID (public) 2025-08-02
router.get('/ask-user/:ask_user_id', getSupportsByAskUserId);

// Get support tickets by answer user ID (public) 2025-08-02
router.get('/answer-user/:ans_by_id', getSupportsByAnsById);

export default router; 