import express from 'express';
const router = express.Router();
import { createGuidedTour, updateGuidedTour, getGuidedTourById, getAllGuidedTours } from '../../../controller/guided-tour.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create guided tour (protected - requires authentication) 2025-08-02
router.post('/', auth, createGuidedTour);

// Update guided tour (protected - requires authentication) 2025-08-02
router.put('/', auth, updateGuidedTour);

// Get all guided tours (public) 2025-08-02
router.get('/', getAllGuidedTours);

// Get guided tour by ID (public) 2025-08-02
router.get('/:guided_id', getGuidedTourById);

export default router; 