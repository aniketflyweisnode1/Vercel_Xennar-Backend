import express from 'express';
const router = express.Router();
import { createFaq, updateFaq, getFaqById, getAllFaqs, getFaqsByFaqTypeId } from '../../../controller/faq.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create FAQ (requires authentication) 2025-08-01
router.post('/', auth, createFaq);

// Update FAQ (requires authentication) 2025-08-01
router.put('/:id', auth, updateFaq);

// Get FAQ by ID (requires authentication) 2025-08-01
router.get('/:id', auth, getFaqById);

// Get FAQs by FAQ Type ID (requires authentication) 2025-08-01
router.get('/faq-type/:faqTypeId', auth, getFaqsByFaqTypeId);

// Get all FAQs (requires authentication) 2025-08-01
router.get('/', auth, getAllFaqs);

export default router; 