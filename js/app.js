/**
 * Task Management / File Dashboard
 * Vanilla JavaScript Frontend connected to Express & MongoDB REST API
 */

// Initial screenshot reference items to seed into DB on first launch
const INITIAL_SEED_TASKS = [
  { title: '.txt', description: 'System configuration parameters, environment variables, and base settings.' },
  { title: 'adsf.txt', description: 'Temporary scratchpad notes, draft calculations, and experimental code snippets.' },
  { title: 'backendoeftxfhh.txt', description: 'Backend service endpoints, route handler logic, and API validation specs.' },
  { title: 'chacha.md.txt', description: 'Project markdown documentation, architecture diagrams, and client integration guide.' },
  { title: 'dbfiles.txt', description: 'Database migration scripts, relational table schemas, and indexing notes.' },
  { title: 'helo.js.txt', description: 'Sample JavaScript utilities, reusable helper functions, and event bus handlers.' },
  { title: 'kushal.txt', description: 'Daily project milestone tracking, assigned tasks, and engineering team notes.' },
  { title: 'nilotpalfrontend.txt', description: 'Frontend component specifications, color system tokens, and responsive layout guidelines.' }
];

// App State
let tasks = [];
let taskToDeleteId = null;
let currentViewingTaskId = null;
let taskToEditId = null;

// DOM Elements
const taskForm = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const descInput = document.getElementById('task-desc');
const titleError = document.getElementById('title-error');
const descError = document.getElementById('desc-error');
const tasksGrid = document.getElementById('tasks-grid');
const emptyState = document.getElementById('empty-state');
const apiStatusBadge = document.getElementById('api-status');
const toastContainer = document.getElementById('toast-container');

// Read More Modal Elements
const readMoreModal = document.getElementById('read-more-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalTaskTitle = document.getElementById('modal-task-title');
const modalTaskDesc = document.getElementById('modal-task-desc');
const modalCreatedAt = document.getElementById('modal-created-at');
const modalUpdatedAt = document.getElementById('modal-updated-at');
const modalCloseIcon = document.getElementById('modal-close-icon');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalDeleteBtn = document.getElementById('modal-delete-btn');
const modalEditBtn = document.getElementById('modal-edit-btn');

// Edit Modal Elements
const editModal = document.getElementById('edit-modal');
const editBackdrop = document.getElementById('edit-backdrop');
const editTaskForm = document.getElementById('edit-task-form');
const editTitleInput = document.getElementById('edit-title');
const editDescInput = document.getElementById('edit-desc');
const editTitleError = document.getElementById('edit-title-error');
const editDescError = document.getElementById('edit-desc-error');
const editCloseIcon = document.getElementById('edit-close-icon');
const editCancelBtn = document.getElementById('edit-cancel-btn');

// Delete Confirm Modal Elements
const deleteConfirmModal = document.getElementById('delete-confirm-modal');
const confirmBackdrop = document.getElementById('confirm-backdrop');
const confirmMessage = document.getElementById('confirm-message');
const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
const confirmCloseIcon = document.getElementById('confirm-close-icon');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

/**
 * Initialize application
 */
async function init() {
  setupEventListeners();
  await updateApiStatus();
  await loadAndDisplayTasks();
}

/**
 * Check and update API health indicator in header
 */
async function updateApiStatus() {
  try {
    const health = await checkHealth();
    if (health && health.success) {
      apiStatusBadge.className = 'api-status-badge connected';
      apiStatusBadge.querySelector('.status-label').textContent = 'API Connected (port 5000)';
    } else {
      apiStatusBadge.className = 'api-status-badge offline';
      apiStatusBadge.querySelector('.status-label').textContent = 'API Offline';
    }
  } catch (e) {
    apiStatusBadge.className = 'api-status-badge offline';
    apiStatusBadge.querySelector('.status-label').textContent = 'API Offline';
  }
}

/**
 * Load tasks from Backend API (Requirement 14 & 15: GET /api/tasks)
 */
async function loadAndDisplayTasks() {
  try {
    tasks = await getTasks();

    // If the database is completely empty on first visit, seed the 8 screenshot reference tasks
    const hasSeeded = localStorage.getItem('has_seeded_mongo_tasks');
    if (tasks.length === 0 && !hasSeeded) {
      localStorage.setItem('has_seeded_mongo_tasks', 'true');
      for (const item of INITIAL_SEED_TASKS) {
        try {
          const created = await createTask(item.title, item.description);
          tasks.push(created);
        } catch (seedErr) {
          console.warn('Could not seed task:', item.title, seedErr.message);
        }
      }
    }

    renderTasks();
  } catch (error) {
    console.error('Failed to load tasks from backend:', error.message);
    showToast('Failed to load tasks from backend. Ensure server is running on port 5000.', 'danger');
  }
}

/**
 * Display toast notification
 */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${escapeHTML(message)}</span>
    <button type="button" class="btn-icon" aria-label="Dismiss toast" style="padding:2px; font-size:16px;">&times;</button>
  `;

  const dismissBtn = toast.querySelector('button');
  dismissBtn.addEventListener('click', () => {
    toast.classList.add('toast-fadeout');
    setTimeout(() => toast.remove(), 200);
  });

  toastContainer.appendChild(toast);

  // Auto-dismiss after 3.5 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('toast-fadeout');
      setTimeout(() => toast.remove(), 200);
    }
  }, 3500);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Format timestamp into readable human string
 */
function formatDate(timestamp) {
  if (!timestamp) return 'Recently';
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Render all task cards into the grid
 */
function renderTasks() {
  if (!tasks || tasks.length === 0) {
    tasksGrid.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  tasksGrid.innerHTML = '';

  tasks.forEach(task => {
    const card = createTaskCardElement(task);
    tasksGrid.appendChild(card);
  });
}

/**
 * Create a DOM card element for a single task
 */
function createTaskCardElement(task) {
  const card = document.createElement('article');
  card.className = 'task-card';
  card.id = `task-card-${task._id}`;

  const escapedTitle = escapeHTML(task.title);

  card.innerHTML = `
    <div class="task-card-header">
      <h3 class="task-card-title" title="${escapedTitle}">${escapedTitle}</h3>
      <div class="task-card-actions">
        <button 
          type="button" 
          class="task-action-btn edit-btn" 
          data-id="${task._id}" 
          aria-label="Edit task: ${escapedTitle}"
          title="Edit task"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </button>
        <button 
          type="button" 
          class="task-action-btn delete-btn" 
          data-id="${task._id}" 
          aria-label="Delete task: ${escapedTitle}"
          title="Delete task"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
    <div class="task-card-footer">
      <button 
        type="button" 
        class="read-more-btn" 
        data-id="${task._id}"
        aria-label="Read more details for ${escapedTitle}"
      >
        read more
      </button>
    </div>
  `;

  // Read More button handler (Requirement 16: calls GET /api/tasks/:id)
  const readMoreBtn = card.querySelector('.read-more-btn');
  readMoreBtn.addEventListener('click', () => openReadMoreModal(task._id));

  // Edit button handler (Requirement 17: PUT /api/tasks/:id)
  const editBtn = card.querySelector('.edit-btn');
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openEditModal(task._id);
  });

  // Delete button handler (Requirement 18: DELETE /api/tasks/:id)
  const deleteBtn = card.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openDeleteConfirmModal(task._id);
  });

  return card;
}

/**
 * Form Submission & Validation Handling (Requirement 6 & 14)
 * Calls POST /api/tasks
 */
async function handleTaskFormSubmit(e) {
  e.preventDefault();

  const titleVal = titleInput.value.trim();
  const descVal = descInput.value.trim();

  let hasError = false;

  // Validate Title
  if (!titleVal) {
    showInputError(titleInput, titleError, 'Please enter a title.');
    hasError = true;
  } else {
    clearInputError(titleInput, titleError);
  }

  // Validate Description
  if (!descVal) {
    showInputError(descInput, descError, 'Please enter task details.');
    hasError = true;
  } else {
    clearInputError(descInput, descError);
  }

  if (hasError) return;

  const submitBtn = document.getElementById('create-task-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating...';

  try {
    // Call backend API: POST /api/tasks
    const createdTask = await createTask(titleVal, descVal);

    // Prepend new task to state
    tasks.unshift(createdTask);

    // Re-render UI
    renderTasks();

    // Clear inputs and error states
    titleInput.value = '';
    descInput.value = '';
    clearInputError(titleInput, titleError);
    clearInputError(descInput, descError);

    showToast('Task created successfully', 'success');

    // Return focus to title input
    titleInput.focus();
  } catch (err) {
    console.error('Error creating task:', err.message);
    showToast(err.message || 'Failed to create task', 'danger');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Task';
  }
}

/**
 * Open "Read More" Modal
 * Fetches full task from GET /api/tasks/:id (Requirement 16)
 */
async function openReadMoreModal(taskId) {
  modalTaskTitle.textContent = 'Loading...';
  modalTaskDesc.textContent = 'Fetching task details from server...';
  modalCreatedAt.textContent = '';
  modalUpdatedAt.textContent = '';

  readMoreModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  try {
    // Call backend API: GET /api/tasks/:id
    const task = await getTask(taskId);
    if (!task) throw new Error('Task not found');

    currentViewingTaskId = taskId;
    modalTaskTitle.textContent = task.title;
    modalTaskDesc.textContent = task.description;
    modalCreatedAt.textContent = `Created: ${formatDate(task.createdAt)}`;
    if (task.updatedAt && task.updatedAt !== task.createdAt) {
      modalUpdatedAt.textContent = `Updated: ${formatDate(task.updatedAt)}`;
    } else {
      modalUpdatedAt.textContent = '';
    }

    modalCloseBtn.focus();
  } catch (err) {
    console.error('Error fetching task details:', err.message);
    modalTaskTitle.textContent = 'Error';
    modalTaskDesc.textContent = err.message || 'Could not load task details from server.';
  }
}

/**
 * Close "Read More" Modal
 */
function closeReadMoreModal() {
  readMoreModal.classList.add('hidden');
  document.body.style.overflow = '';
  currentViewingTaskId = null;
}

/**
 * Open "Edit" Modal (Requirement 17)
 */
async function openEditModal(taskId) {
  taskToEditId = taskId;
  const existing = tasks.find(t => t._id === taskId);

  editTitleInput.value = existing ? existing.title : '';
  editDescInput.value = existing ? existing.description : '';
  clearInputError(editTitleInput, editTitleError);
  clearInputError(editDescInput, editDescError);

  editModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  editTitleInput.focus();

  // If description was not loaded or partial, fetch fresh from GET /api/tasks/:id
  try {
    const fullTask = await getTask(taskId);
    if (fullTask) {
      editTitleInput.value = fullTask.title;
      editDescInput.value = fullTask.description;
    }
  } catch (e) {
    console.warn('Could not fetch fresh task for edit:', e.message);
  }
}

/**
 * Close "Edit" Modal
 */
function closeEditModal() {
  editModal.classList.add('hidden');
  if (readMoreModal.classList.contains('hidden')) {
    document.body.style.overflow = '';
  }
  taskToEditId = null;
}

/**
 * Handle Edit Form Submit (Requirement 17: PUT /api/tasks/:id)
 */
async function handleEditFormSubmit(e) {
  e.preventDefault();
  if (!taskToEditId) return;

  const newTitle = editTitleInput.value.trim();
  const newDesc = editDescInput.value.trim();

  let hasError = false;
  if (!newTitle) {
    showInputError(editTitleInput, editTitleError, 'Please enter a title.');
    hasError = true;
  } else {
    clearInputError(editTitleInput, editTitleError);
  }

  if (!newDesc) {
    showInputError(editDescInput, editDescError, 'Please enter task details.');
    hasError = true;
  } else {
    clearInputError(editDescInput, editDescError);
  }

  if (hasError) return;

  const saveBtn = document.getElementById('edit-save-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    // Call backend API: PUT /api/tasks/:id
    const updated = await updateTask(taskToEditId, newTitle, newDesc);

    // Update in local memory array
    const idx = tasks.findIndex(t => t._id === taskToEditId);
    if (idx !== -1) {
      tasks[idx] = updated;
    }

    renderTasks();
    closeEditModal();

    // If Read More modal was open for this task, refresh it
    if (currentViewingTaskId === taskToEditId) {
      modalTaskTitle.textContent = updated.title;
      modalTaskDesc.textContent = updated.description;
      modalUpdatedAt.textContent = `Updated: ${formatDate(updated.updatedAt)}`;
    }

    showToast('Task updated successfully', 'success');
  } catch (err) {
    console.error('Error updating task:', err.message);
    showToast(err.message || 'Failed to update task', 'danger');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Changes';
  }
}

/**
 * Open "Delete Confirmation" Modal (Requirement 18)
 */
function openDeleteConfirmModal(taskId) {
  const task = tasks.find(t => t._id === taskId);
  taskToDeleteId = taskId;

  const title = task ? task.title : 'this task';
  confirmMessage.textContent = `Are you sure you want to delete "${title}"? This action cannot be undone.`;

  deleteConfirmModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  confirmCancelBtn.focus();
}

/**
 * Close "Delete Confirmation" Modal
 */
function closeDeleteConfirmModal() {
  deleteConfirmModal.classList.add('hidden');
  if (readMoreModal.classList.contains('hidden') && editModal.classList.contains('hidden')) {
    document.body.style.overflow = '';
  }
  taskToDeleteId = null;
}

/**
 * Confirm and execute task deletion (Requirement 18: DELETE /api/tasks/:id)
 */
async function executeDeleteTask() {
  if (!taskToDeleteId) return;

  const targetId = taskToDeleteId;
  confirmDeleteBtn.disabled = true;
  confirmDeleteBtn.textContent = 'Deleting...';

  try {
    // Call backend API: DELETE /api/tasks/:id
    await deleteTask(targetId);

    // Remove task from memory state
    tasks = tasks.filter(t => t._id !== targetId);

    // If the deleted task is open in Read More modal, close it
    if (currentViewingTaskId === targetId) {
      closeReadMoreModal();
    }

    closeDeleteConfirmModal();
    renderTasks();
    showToast('Task deleted successfully', 'success');
  } catch (err) {
    console.error('Error deleting task:', err.message);
    showToast(err.message || 'Failed to delete task', 'danger');
  } finally {
    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.textContent = 'Delete';
  }
}

/**
 * Helper to display input error
 */
function showInputError(inputEl, errorEl, message) {
  inputEl.classList.add('is-invalid');
  errorEl.textContent = message;
  errorEl.classList.add('active');
}

/**
 * Helper to clear input error
 */
function clearInputError(inputEl, errorEl) {
  inputEl.classList.remove('is-invalid');
  errorEl.textContent = '';
  errorEl.classList.remove('active');
}

/**
 * Setup Global Event Listeners
 */
function setupEventListeners() {
  // Main form submission
  taskForm.addEventListener('submit', handleTaskFormSubmit);

  // Live input error clear
  titleInput.addEventListener('input', () => {
    if (titleInput.value.trim()) clearInputError(titleInput, titleError);
  });
  descInput.addEventListener('input', () => {
    if (descInput.value.trim()) clearInputError(descInput, descError);
  });

  // Edit form submission
  editTaskForm.addEventListener('submit', handleEditFormSubmit);
  editCloseIcon.addEventListener('click', closeEditModal);
  editCancelBtn.addEventListener('click', closeEditModal);
  editBackdrop.addEventListener('click', closeEditModal);

  // Read More Modal close events
  modalCloseIcon.addEventListener('click', closeReadMoreModal);
  modalCloseBtn.addEventListener('click', closeReadMoreModal);
  modalBackdrop.addEventListener('click', closeReadMoreModal);

  // Action inside Read More Modal
  modalDeleteBtn.addEventListener('click', () => {
    if (currentViewingTaskId) openDeleteConfirmModal(currentViewingTaskId);
  });
  modalEditBtn.addEventListener('click', () => {
    if (currentViewingTaskId) openEditModal(currentViewingTaskId);
  });

  // Confirm Modal events
  confirmCloseIcon.addEventListener('click', closeDeleteConfirmModal);
  confirmCancelBtn.addEventListener('click', closeDeleteConfirmModal);
  confirmBackdrop.addEventListener('click', closeDeleteConfirmModal);
  confirmDeleteBtn.addEventListener('click', executeDeleteTask);

  // Keyboard accessibility: Escape key closes active modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!deleteConfirmModal.classList.contains('hidden')) {
        closeDeleteConfirmModal();
      } else if (!editModal.classList.contains('hidden')) {
        closeEditModal();
      } else if (!readMoreModal.classList.contains('hidden')) {
        closeReadMoreModal();
      }
    }
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
