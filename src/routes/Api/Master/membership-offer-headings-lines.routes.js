import express from 'express';
const router = express.Router();
import { 
  createMembershipOfferHeadingLine, 
  updateMembershipOfferHeadingLine, 
  getMembershipOfferHeadingLineById, 
  getAllMembershipOfferHeadingLines 
} from '../../../controller/membership-offer-headings-lines.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create membership offer heading line (requires authentication) 2025-07-30
router.post('/', auth, createMembershipOfferHeadingLine); 

// Update membership offer heading line (requires authentication) 2025-07-30
router.put('/', auth, updateMembershipOfferHeadingLine);

// Get membership offer heading line by ID (requires authentication) 2025-07-30
router.get('/:id', auth, getMembershipOfferHeadingLineById);

// Get all membership offer heading lines (requires authentication) 2025-07-30
router.get('/', auth, getAllMembershipOfferHeadingLines);

export default router; 