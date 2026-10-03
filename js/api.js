/**
 * Frontend REST API Client Helper
 * Connects frontend dashboard to Express + MongoDB backend
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Health check endpoint
 * @returns {Promise<Object>}
 */
async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Health check failed:', err.message);
    return { success: false, message: 'Backend unreachable' };
  }
}

/**
 * Fetch all tasks from MongoDB (Requirement 7 & 15)
 * @returns {Promise<Array>}
 */
async function getTasks() {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }
    const data = await response.json();
    return data.tasks || [];
  } catch (error) {
    console.error('[API] getTasks error:', error.message);
    throw error;
  }
}

/**
 * Fetch a single task by ID from MongoDB (Requirement 8, 15, & 16)
 * @param {string} id
 * @returns {Promise<Object>}
 */
async function getTask(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to fetch task (${response.status})`);
    }
    const data = await response.json();
    return data.task;
  } catch (error) {
    console.error('[API] getTask error:', error.message);
    throw error;
  }
}

/**
 * Create a new task in MongoDB (Requirement 6 & 15)
 * @param {string} title
 * @param {string} description
 * @returns {Promise<Object>}
 */
async function createTask(title, description) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, description })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create task');
    }
    return data.task;
  } catch (error) {
    console.error('[API] createTask error:', error.message);
    throw error;
  }
}

/**
 * Update an existing task in MongoDB (Requirement 9, 15, & 17)
 * @param {string} id
 * @param {string} title
 * @param {string} description
 * @returns {Promise<Object>}
 */
async function updateTask(id, title, description) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, description })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update task');
    }
    return data.task;
  } catch (error) {
    console.error('[API] updateTask error:', error.message);
    throw error;
  }
}

/**
 * Delete a task from MongoDB (Requirement 10, 15, & 18)
 * @param {string} id
 * @returns {Promise<boolean>}
 */
async function deleteTask(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete task');
    }
    return true;
  } catch (error) {
    console.error('[API] deleteTask error:', error.message);
    throw error;
  }
}
