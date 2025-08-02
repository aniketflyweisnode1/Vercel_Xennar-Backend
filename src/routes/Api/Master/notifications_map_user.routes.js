import express from 'express';
const router = express.Router();
import { getNotificationMapUserById, getAllNotificationMapUsers, getAllNotificationMapByAuth, viewNotification } from '../../../controller/notifications_map_user.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Get all notification map users 2025-07-28
router.get('/', auth, getAllNotificationMapUsers);

// Get all notification mappings for authenticated user 2025-07-28
router.get('/user', auth, getAllNotificationMapByAuth);

// Get all notification mappings for authenticated user (alternative route) 2025-07-28
router.get('/notificationsbyauth', auth, getAllNotificationMapByAuth);

// Mark single notification as viewed 2025-07-28
router.put('/mark-viewed', auth, viewNotification);

// Get notification map user by ID 2025-07-28 - MUST BE LAST
router.get('/:id', auth, getNotificationMapUserById);

export default router; 