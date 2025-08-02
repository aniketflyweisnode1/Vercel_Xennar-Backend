import express from 'express';
const router = express.Router();
import { createImageTemplate, getImageTemplateById, getAllImageTemplates, updateImageTemplate } from '../../../controller/image-template.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create image template 2025-07-29
router.post('/', auth, createImageTemplate);

// Update image template 2025-07-29
router.put('/', auth, updateImageTemplate);

// Get all image templates 2025-07-29
router.get('/:id', auth, getImageTemplateById);

// Get all image templates 2025-07-29
router.get('/', auth, getAllImageTemplates);

export default router; 