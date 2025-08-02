import express from 'express';
const router = express.Router();
import { createLegalPrivacy, updateLegalPrivacy, getLegalPrivacyById, getAllLegalPrivacies } from '../../../controller/legal-privacy.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create Legal Privacy (requires authentication) 2025-08-01
router.post('/', auth, createLegalPrivacy);

// Update Legal Privacy (requires authentication) 2025-08-01
router.put('/:id', auth, updateLegalPrivacy);

// Get Legal Privacy by ID (requires authentication) 2025-08-01
router.get('/:id', auth, getLegalPrivacyById);

// Get all Legal Privacies (requires authentication) 2025-08-01
router.get('/', auth, getAllLegalPrivacies);

export default router; 