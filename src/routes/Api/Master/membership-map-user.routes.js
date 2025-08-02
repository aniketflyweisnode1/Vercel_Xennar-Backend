import express from 'express';
const router = express.Router();
import { 
  createMembershipMapUser, 
  updateMembershipMapUser, 
  getMembershipMapUserById, 
  getAllMembershipMapUsers,
  getActiveMemberships
} from '../../../controller/membership-map-user.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create membership map user (requires authentication) 2025-07-30
router.post('/', auth, createMembershipMapUser);

// Update membership map user (requires authentication) 2025-07-30
router.put('/', auth, updateMembershipMapUser);

// Get all membership map users (requires authentication) 2025-07-30
router.get('/', auth, getAllMembershipMapUsers);

// Get active memberships for authenticated user (requires authentication) 2025-07-31
router.get('/active_membership', auth, getActiveMemberships);

// Get membership map user by ID (requires authentication) 2025-07-30 - MUST BE LAST
router.get('/:id', auth, getMembershipMapUserById);

export default router; 