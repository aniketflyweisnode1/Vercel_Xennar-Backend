import express from 'express';
const router = express.Router();
import { 
  createMembershipPackage, 
  updateMembershipPackage, 
  getMembershipPackageById, 
  getAllMembershipPackages 
} from '../../../controller/membership-package.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create membership package (requires authentication) 2025-07-30
router.post('/', auth, createMembershipPackage);

// Update membership package (requires authentication) 2025-07-30
router.put('/', auth, updateMembershipPackage);

// Get membership package by ID (requires authentication) 2025-07-30
router.get('/:id', auth, getMembershipPackageById);

// Get all membership packages (requires authentication) 2025-07-30
router.get('/', auth, getAllMembershipPackages);

export default router; 