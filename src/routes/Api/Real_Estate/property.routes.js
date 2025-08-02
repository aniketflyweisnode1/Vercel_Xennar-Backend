import express from 'express';
const router = express.Router();
import { createProperty, getPropertyById, getAllProperties, updateProperty, getPropertiesByPropertyType, getPropertiesByAuthUser, updateMarkRented, getTeamMemberAndTaskData } from '../../../controller/property.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create property 2025-07-29
router.post('/', auth, createProperty);
// Update property 2025-07-29
router.put('/', auth, updateProperty);
// Update mark_rented field 2025-07-30
router.put('/mark-rented', auth, updateMarkRented);
// Get all properties 2025-07-29
router.get('/', auth, getAllProperties);
// Get properties by property type names 2025-07-29
router.get('/by-property-type', auth, getPropertiesByPropertyType);
// Get properties by auth user 2025-07-29
router.get('/dashboard', auth, getPropertiesByAuthUser);
// Get team member add and task Completed  data for today 2025-08-01
router.get('/team-task-add-completed', auth, getTeamMemberAndTaskData);
// Get property by ID 2025-07-29 (MUST BE LAST - wildcard route)
router.get('/:id', auth, getPropertyById);

export default router; 