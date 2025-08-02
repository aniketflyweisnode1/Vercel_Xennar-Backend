import express from 'express';
const router = express.Router();
import { createState, getStateById, getAllStates, updateState } from '../../../controller/state.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create state 2025-07-29
router.post('/', auth, createState);

// Update state 2025-07-29
router.put('/', auth, updateState);

// Get state by ID 2025-07-29
router.get('/:id', auth, getStateById);

// Get all states 2025-07-29
router.get('/', auth, getAllStates);

export default router; 