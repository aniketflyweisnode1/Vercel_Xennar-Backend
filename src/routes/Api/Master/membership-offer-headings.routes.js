import express from 'express';
const router = express.Router();
import { 
  createMembershipOfferHeading, 
  updateMembershipOfferHeading, 
  getMembershipOfferHeadingById, 
  getAllMembershipOfferHeadings 
} from '../../../controller/membership-offer-headings.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create membership offer heading (requires authentication) 2025-07-30
router.post('/', auth, createMembershipOfferHeading);

// Update membership offer heading (requires authentication) 2025-07-30
router.put('/', auth, updateMembershipOfferHeading);

// Get membership offer heading by ID (requires authentication) 2025-07-30
router.get('/:id', auth, getMembershipOfferHeadingById);

// Get all membership offer headings (requires authentication) 2025-07-30
router.get('/', auth, getAllMembershipOfferHeadings);

export default router; 