import express from 'express';
const router = express.Router();
import { createCity, getCityById, getAllCities, updateCity } from '../../../controller/city.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create city 2025-07-29
router.post('/', auth, createCity);

// Update city 2025-07-29
router.put('/', auth, updateCity);

// Get city by ID 2025-07-29
router.get('/:id', auth, getCityById);

// Get all cities 2025-07-29 
router.get('/', auth, getAllCities);

export default router; 