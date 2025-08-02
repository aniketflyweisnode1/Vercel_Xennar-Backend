import express from 'express';
const router = express.Router();
import { createFaqType, updateFaqType, getFaqTypeById, getAllFaqTypes } from '../../../controller/faq-type.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create FAQ Type (requires authentication) 2025-08-01
router.post('/', auth, createFaqType);

// Update FAQ Type (requires authentication) 2025-08-01
router.put('/:id', auth, updateFaqType);

// Get FAQ Type by ID (requires authentication) 2025-08-01
router.get('/:id', auth, getFaqTypeById);

// Get all FAQ Types (requires authentication) 2025-08-01
router.get('/', auth, getAllFaqTypes);

export default router; 