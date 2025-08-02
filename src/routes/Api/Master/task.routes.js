import express from 'express';
const router = express.Router();
import { 
  createTask, 
  updateTask, 
  getTaskById, 
  getAllTasks,
  getTaskDashboard,
  getPendingTasks,
  getInProgressTasks,
  getCompletedTasks,
  getTasksByStatus,
  sendTaskReminder
} from '../../../controller/task.controller.js';
import auth from '../../../middleware/auth.middleware.js';

// Create task (requires authentication) 2025-07-31
router.post('/', auth, createTask);

// Update task (requires authentication) 2025-07-31
router.put('/', auth, updateTask);

// Get all tasks (requires authentication) 2025-07-31
router.get('/', auth, getAllTasks);

// Task Dashboard API (requires authentication) 2025-07-31
router.get('/Task-dashboard', auth, getTaskDashboard);

// Get tasks by status - Pending (requires authentication) 2025-07-31
router.get('/pending', auth, getPendingTasks);

// Get tasks by status - In Progress (requires authentication) 2025-07-31
router.get('/in-progress', auth, getInProgressTasks);

// Get tasks by status - Completed (requires authentication) 2025-07-31
router.get('/completed', auth, getCompletedTasks);

// Get tasks by status - Universal endpoint (requires authentication) 2025-07-31
router.get('/by-status', auth, getTasksByStatus);

// Send task reminder (requires authentication) 2025-07-31
router.post('/:task_id/reminder', auth, sendTaskReminder);

// Get task by ID (requires authentication) 2025-07-31 - MUST BE LAST
router.get('/:task_id', auth, getTaskById);

export default router; 