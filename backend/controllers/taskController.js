const mongoose = require('mongoose');
const Task = require('../models/Task');
const { validateTaskInput, isValidObjectId } = require('../utils/validation');

// In-memory fallback store used ONLY when local MongoDB daemon is not running
let memoryTasks = [];

/**
 * Helper to check if MongoDB is currently connected
 */
const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Public
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    // Validate request inputs (Requirement 6)
    const validation = validateTaskInput(req.body, false);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message || 'Title and description are required'
      });
    }

    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (isMongoConnected()) {
      // Create persistent record via Mongoose Task model
      const task = await Task.create({
        title: trimmedTitle,
        description: trimmedDesc
      });

      return res.status(201).json({
        success: true,
        message: 'Task created successfully',
        task
      });
    } else {
      // Fallback in-memory task when MongoDB daemon is not currently active
      const now = new Date();
      const fallbackTask = {
        _id: new mongoose.Types.ObjectId().toString(),
        title: trimmedTitle,
        description: trimmedDesc,
        createdAt: now,
        updatedAt: now
      };

      memoryTasks.unshift(fallbackTask);

      return res.status(201).json({
        success: true,
        message: 'Task created successfully',
        task: fallbackTask
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tasks (newest first)
 * @route   GET /api/tasks
 * @access  Public
 */
const getAllTasks = async (req, res, next) => {
  try {
    if (isMongoConnected()) {
      // Sort newest tasks first (Requirement 7)
      const tasks = await Task.find().sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: tasks.length,
        tasks
      });
    } else {
      // Return memory tasks sorted newest first
      const sorted = [...memoryTasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.status(200).json({
        success: true,
        count: sorted.length,
        tasks: sorted
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 * @access  Public
 */
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId (Requirement 8)
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format'
      });
    }

    if (isMongoConnected()) {
      const task = await Task.findById(id);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      return res.status(200).json({
        success: true,
        task
      });
    } else {
      const task = memoryTasks.find(t => t._id.toString() === id);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      return res.status(200).json({
        success: true,
        task
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing task
 * @route   PUT /api/tasks/:id
 * @access  Public
 */
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId (Requirement 9)
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format'
      });
    }

    // Validate update inputs
    const validation = validateTaskInput(req.body, true);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const updateFields = {};
    if (req.body.title !== undefined) updateFields.title = req.body.title.trim();
    if (req.body.description !== undefined) updateFields.description = req.body.description.trim();

    if (isMongoConnected()) {
      const task = await Task.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        task
      });
    } else {
      const taskIndex = memoryTasks.findIndex(t => t._id.toString() === id);

      if (taskIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      if (updateFields.title !== undefined) memoryTasks[taskIndex].title = updateFields.title;
      if (updateFields.description !== undefined) memoryTasks[taskIndex].description = updateFields.description;
      memoryTasks[taskIndex].updatedAt = new Date();

      return res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        task: memoryTasks[taskIndex]
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Public
 */
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId (Requirement 10)
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format'
      });
    }

    if (isMongoConnected()) {
      const task = await Task.findByIdAndDelete(id);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      });
    } else {
      const initialLength = memoryTasks.length;
      memoryTasks = memoryTasks.filter(t => t._id.toString() !== id);

      if (memoryTasks.length === initialLength) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask
};
