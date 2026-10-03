const mongoose = require('mongoose');

/**
 * Task Schema Definition
 * Stores tasks/files for the dark-mode dashboard
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true
    },
    // Optional user reference reserved for future authentication
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null
    }
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    versionKey: false
  }
);

// Ensure index on createdAt for fast sorting newest-first
taskSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
