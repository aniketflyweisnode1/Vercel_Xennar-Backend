import express from 'express';
const router = express.Router();
import { createPropertyCondition, getPropertyConditionById, getAllPropertyConditions, updatePropertyCondition } from '../../../controller/property-condition.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create property condition 2025-07-29
router.post('/', auth, createPropertyCondition);

// Update property condition 2025-07-29
router.put('/', auth, updatePropertyCondition);

// Get property condition by ID 2025-07-29
router.get('/:id', auth, getPropertyConditionById);

// Get all property conditions 2025-07-29
router.get('/', auth, getAllPropertyConditions);

export default router; 