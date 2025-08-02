import express from 'express';
const router = express.Router();
import { createPropertyUserSubscribe, getPropertyUserSubscribeById, getAllPropertyUserSubscribes, updatePropertyUserSubscribe } from '../../../controller/property-user-subscribe.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create property user subscribe 2025-07-29
router.post('/', auth, createPropertyUserSubscribe);

// Update property user subscribe 2025-07-29
router.put('/', auth, updatePropertyUserSubscribe);

// Get property user subscribe by ID 2025-07-29
router.get('/:id', auth, getPropertyUserSubscribeById);

// Get all property user subscribes 2025-07-29
router.get('/', auth, getAllPropertyUserSubscribes);

export default router; 