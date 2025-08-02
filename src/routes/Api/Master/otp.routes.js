import express from 'express';
const router = express.Router();
import { createOTP, updateOTP, getOTPById, getAllOTPs, verifyOTP, getOTPValue } from '../../../controller/otp.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Public routes 2025-07-28
router.post('/verify', verifyOTP);


// Create OTP 2025-07-28
router.post('/create', auth, createOTP);

// Update OTP by ID (ID in request body) 2025-07-28
router.put('/update', auth, updateOTP);

// Get all OTPs (must come before getById to avoid route conflicts) 2025-07-28
router.get('/', auth, getAllOTPs);

// Get OTP by ID 2025-07-28
router.get('/:id', auth, getOTPById);

// Get OTP value (for testing - remove in production) 2025-07-28
router.get('/value/:id', auth, getOTPValue);

export default router; 