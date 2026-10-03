const mongoose = require('mongoose');

/**
 * Validates task payload for creation and updates
 * @param {Object} data - { title, description }
 * @param {Boolean} isUpdate - If true, fields can be optionally present
 * @returns {Object} { isValid: boolean, message?: string }
 */
const validateTaskInput = (data, isUpdate = false) => {
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      message: 'Request body must be a valid JSON object'
    };
  }

  const { title, description } = data;

  // For creation: both title and description are strictly required
  if (!isUpdate) {
    if (title === undefined || description === undefined) {
      return {
        isValid: false,
        message: 'Title and description are required'
      };
    }

    if (typeof title !== 'string' || typeof description !== 'string') {
      return {
        isValid: false,
        message: 'Title and description must be strings'
      };
    }

    if (title.trim().length === 0 || description.trim().length === 0) {
      return {
        isValid: false,
        message: 'Title and description are required'
      };
    }
  } else {
    // For update: at least one field should be provided and non-empty
    if (title === undefined && description === undefined) {
      return {
        isValid: false,
        message: 'At least one field (title or description) must be provided to update'
      };
    }

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return {
          isValid: false,
          message: 'Title cannot be empty and must be a string'
        };
      }
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim().length === 0) {
        return {
          isValid: false,
          message: 'Description cannot be empty and must be a string'
        };
      }
    }
  }

  return { isValid: true };
};

/**
 * Validates if the provided string is a valid MongoDB ObjectId
 * @param {string} id
 * @returns {boolean}
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && (String(new mongoose.Types.ObjectId(id)) === id);
};

module.exports = {
  validateTaskInput,
  isValidObjectId
};
