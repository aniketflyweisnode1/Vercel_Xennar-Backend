import express from 'express';
const router = express.Router();
import { createPropertyType, getPropertyTypeById, getAllPropertyTypes, updatePropertyType } from '../../../controller/property-type.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create property type 2025-07-29
router.post('/', auth, createPropertyType);

// Update property type 2025-07-29
router.put('/', auth, updatePropertyType);

// Get property type by ID 2025-07-29
router.get('/:id', auth, getPropertyTypeById);

// Get all property types 2025-07-29
router.get('/', auth, getAllPropertyTypes);

export default router; 