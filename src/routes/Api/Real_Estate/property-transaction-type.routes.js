import express from 'express';
const router = express.Router();
import { createPropertyTransactionType, getPropertyTransactionTypeById, getAllPropertyTransactionTypes, updatePropertyTransactionType } from '../../../controller/property-transaction-type.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create property transaction type 2025-07-29
router.post('/', auth, createPropertyTransactionType);

// Update property transaction type 2025-07-29
router.put('/', auth, updatePropertyTransactionType);

// Get property transaction type by ID 2025-07-29
router.get('/:id', auth, getPropertyTransactionTypeById);

// Get all property transaction types 2025-07-29
router.get('/', auth, getAllPropertyTransactionTypes);

export default router; 