import express from 'express';
const router = express.Router();
import { createPropertyWashroom, getPropertyWashroomById, getAllPropertyWashrooms, updatePropertyWashroom } from '../../../controller/property-washroom.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create property washroom 2025-07-29
router.post('/', auth, createPropertyWashroom);

// Update property washroom 2025-07-29
router.put('/', auth, updatePropertyWashroom);

// Get property washroom by ID 2025-07-29
router.get('/:id', auth, getPropertyWashroomById);

// Get all property washrooms 2025-07-29
router.get('/', auth, getAllPropertyWashrooms);

export default router; 