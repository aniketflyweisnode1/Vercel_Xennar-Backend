import express from 'express';
const router = express.Router();
import { createMusic, getMusicById, getAllMusic, updateMusic } from '../../../controller/music.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create music 2025-07-29
router.post('/', auth, createMusic);

// Update music 2025-07-29


// Get music by ID 2025-07-29
router.put('/', auth, updateMusic);

// Get all music 2025-07-29
router.get('/:id', auth, getMusicById);

// Get all music 2025-07-29
router.get('/', auth, getAllMusic);

export default router; 