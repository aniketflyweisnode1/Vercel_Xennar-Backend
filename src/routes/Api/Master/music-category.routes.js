import express from 'express';
const router = express.Router();
import {
  createMusicCategory,
  updateMusicCategory,
  getMusicCategoryById,
  getAllMusicCategories
} from '../../../controller/music-category.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create music category (requires authentication) 2025-07-31
router.post('/', auth, createMusicCategory);

// Update music category (requires authentication) 2025-07-31
router.put('/', auth, updateMusicCategory);

// Get music category by ID (requires authentication) 2025-07-31
router.get('/:MCategory_id', auth, getMusicCategoryById);

// Get all music categories (requires authentication) 2025-07-31
router.get('/', auth, getAllMusicCategories);

export default router; 