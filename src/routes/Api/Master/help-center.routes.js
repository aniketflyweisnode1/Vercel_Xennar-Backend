import express from 'express';
const router = express.Router();
import { createHelpCenter, updateHelpCenter, getHelpCenterById, getAllHelpCenters } from '../../../controller/help-center.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create Help Center (requires authentication) 2025-08-01
router.post('/', auth, createHelpCenter);

// Update Help Center (requires authentication) 2025-08-01
router.put('/:id', auth, updateHelpCenter);

// Get Help Center by ID (requires authentication) 2025-08-01
router.get('/:id', auth, getHelpCenterById);

// Get all Help Centers (requires authentication) 2025-08-01
router.get('/', auth, getAllHelpCenters);

export default router; 