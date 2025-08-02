import express from 'express';
const router = express.Router();
import { createPropertySubType, getPropertySubTypeById, getAllPropertySubTypes, updatePropertySubType } from '../../../controller/property-sub-type.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create property sub type 2025-07-29
router.post('/', auth, createPropertySubType);

// Update property sub type 2025-07-29
router.put('/', auth, updatePropertySubType);

// Get property sub type by ID 2025-07-29
router.get('/:id', auth, getPropertySubTypeById);

// Get all property sub types 2025-07-29
router.get('/', auth, getAllPropertySubTypes);

export default router; 