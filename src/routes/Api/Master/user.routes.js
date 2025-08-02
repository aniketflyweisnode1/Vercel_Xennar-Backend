import express from 'express';
const router = express.Router();
import { getUserById, getAllUsers, updateIndustryType, updateBiometricAuthentication, updateWhatsAppNotifications, updateTaskReminder, getUsersByCreatedBy } from '../../../controller/user.controller.js';
import { login, register, getProfile, updateProfile, changePassword, adminLogin, checkTokenExpiry, signOut } from '../../../controller/auth.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Authentication routes (public) 2025-07-28
router.post('/login', login);
// Admin login route (public) 2025-08-02
router.post('/admin-login', adminLogin);
// Check token expiry (public) 2025-08-02
router.get('/check-token', checkTokenExpiry);
// Sign out (protected - requires authentication) 2025-08-02
router.post('/sign-out', auth, signOut);
// register 2025-07-28
router.post('/register', register);
// Profile management Protected routes (require authentication) 2025-07-28
router.get('/profile', auth, getProfile);
// update Profile 2025-07-28
router.put('/profile', auth, updateProfile);
// change password 2025-07-28
router.put('/change-password', auth, changePassword);
// industry type 2025-07-28
router.put('/industry-type', auth, updateIndustryType);
// Update biometric authentication status 2025-07-31
router.put('/biometric-authentication', auth, updateBiometricAuthentication);
// Update WhatsApp notifications status 2025-07-31  
router.put('/whatsapp-notifications', auth, updateWhatsAppNotifications);
// Update task reminder status 2025-07-31
router.put('/task-reminder', auth, updateTaskReminder);
// Get user all 2025-07-28
router.get('/', auth, getAllUsers);
// Get users by authenticated user's created_by 2025-08-01
router.get('/myTeam', auth, getUsersByCreatedBy);
// Get user by ID 2025-07-28
router.get('/:id', auth, getUserById);

export default router; 