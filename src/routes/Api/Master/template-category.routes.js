import express from 'express';
const router = express.Router();
import {
  createTemplateCategory,
  updateTemplateCategory,
  getTemplateCategoryById,
  getAllTemplateCategories
} from '../../../controller/template-category.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create template category (requires authentication) 2025-07-31
router.post('/', auth, createTemplateCategory);

// Update template category (requires authentication) 2025-07-31
router.put('/', auth, updateTemplateCategory);

// Get template category by ID (requires authentication) 2025-07-31
router.get('/:TemCategory_id', auth, getTemplateCategoryById);

// Get all template categories (requires authentication) 2025-07-31
router.get('/', auth, getAllTemplateCategories);

export default router; 