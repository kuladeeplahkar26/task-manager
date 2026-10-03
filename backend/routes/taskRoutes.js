const express = require('express');
const router = express.Router();
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

// Route: /api/tasks
router
  .route('/')
  .get(getAllTasks)
  .post(createTask);

// Route: /api/tasks/:id
router
  .route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
