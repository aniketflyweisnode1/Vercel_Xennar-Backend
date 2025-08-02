import express from 'express';
const router = express.Router();
import { 
  createNotification, 
  sendNotificationByIndustryType, 
  sendNotificationToUsers, 
  updateNotification, 
  getNotificationById, 
  getAllNotifications 
} from '../../../controller/notifications.controller.js';

import auth from '../../../middleware/auth.middleware.js';

// ========================================
// REGULAR NOTIFICATIONS ROUTES
// ========================================

// Create notification 2025-07-28
router.post('/create', auth, createNotification);

// Send notification to all users by industry type 2025-07-28
router.post('/send-by-industry', auth, sendNotificationByIndustryType);

// Send notification to specific users with notification_active check 2025-07-31
router.post('/send-to-users', auth, sendNotificationToUsers);

// Update notification 2025-07-28
router.put('/update', auth, updateNotification);

// Get all notifications 2025-07-28
router.get('/', auth, getAllNotifications);

// Get notification by ID 2025-07-28
router.get('/:id', auth, getNotificationById);



export default router; 