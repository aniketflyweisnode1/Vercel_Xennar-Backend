import express from 'express';
const router = express.Router();
import { createAboutXennar, updateAboutXennar, getAboutXennarById, getAllAboutXennars } from '../../../controller/about-xennar.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create About Xennar (requires authentication) 2025-08-01
router.post('/', auth, createAboutXennar);

// Update About Xennar (requires authentication) 2025-08-01
router.put('/:id', auth, updateAboutXennar);

// Get About Xennar by ID (requires authentication) 2025-08-01
router.get('/:id', auth, getAboutXennarById);

// Get all About Xennars (requires authentication) 2025-08-01
router.get('/', auth, getAllAboutXennars);

export default router; 