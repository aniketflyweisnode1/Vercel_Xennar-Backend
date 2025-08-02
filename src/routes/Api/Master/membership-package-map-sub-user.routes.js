import express from 'express';
const router = express.Router();
import { 
  createMembershipPackageMapSubUser, 
  updateMembershipPackageMapSubUser, 
  getMembershipPackageMapSubUserById, 
  getAllMembershipPackageMapSubUsers,
  getMembershipPackageMapSubUsersByPackageId
} from '../../../controller/membership-package-map-sub-user.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create membership package map sub-user (protected - requires authentication) 2025-08-02
router.post('/', auth, createMembershipPackageMapSubUser);

// Update membership package map sub-user (protected - requires authentication) 2025-08-02
router.put('/', auth, updateMembershipPackageMapSubUser);

// Get all membership package map sub-users (public) 2025-08-02
router.get('/', getAllMembershipPackageMapSubUsers);

// Get membership package map sub-user by ID (public) 2025-08-02
router.get('/:package_sub_user_id', getMembershipPackageMapSubUserById);

// Get membership package map sub-users by membership package ID (protected - requires authentication) 2025-08-02
router.get('/package/:membership_package_id', auth, getMembershipPackageMapSubUsersByPackageId);

export default router; 