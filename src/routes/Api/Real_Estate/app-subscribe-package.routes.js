import express from 'express';
const router = express.Router();
import { createAppSubscribePackage, getAppSubscribePackageById, getAllAppSubscribePackages, updateAppSubscribePackage } from '../../../controller/app-subscribe-package.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create app subscribe package 2025-07-29
router.post('/', auth, createAppSubscribePackage);

// Update app subscribe package 2025-07-29
router.put('/', auth, updateAppSubscribePackage);

// Get app subscribe package by ID 2025-07-29 
router.get('/:id', auth, getAppSubscribePackageById);

// Get all app subscribe packages 2025-07-29
router.get('/', auth, getAllAppSubscribePackages);

export default router; 