import express from 'express';
const router = express.Router();
import { 
  createRole, 
  updateRole, 
  getRoleById, 
  getAllRoles 
} from '../../../controller/role.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create role (requires authentication) 2025-07-30
router.post('/', auth, createRole);

// Update role (requires authentication) 2025-07-30
router.put('/', auth, updateRole);

// Get role by ID (requires authentication) 2025-07-30
router.get('/:role_id', auth, getRoleById);

// Get all roles (requires authentication) 2025-07-30
router.get('/', auth, getAllRoles);

export default router; 