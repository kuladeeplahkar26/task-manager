/**
 * ============================================================================
 * TaskFlow – Task Manager Web Application
 * ============================================================================
 * 
 * Technology Stack:
 * - Backend: Node.js & Express.js
 * - Storage: Built-in File System ("fs") module with individual .txt files
 * - Path Handling: Node.js built-in "path" module
 * - Frontend: Semantic HTML5, CSS3 (Modern Blue & White Theme)
 * 
 * Demonstrates:
 * - express.urlencoded({ extended: true }) for parsing form data
 * - req.body for accessing form inputs (title, description)
 * - req.params for retrieving dynamic URL parameters (:filename)
 * - fs.writeFile() for creating/saving task files asynchronously
 * - fs.readdir() for listing all task files asynchronously
 * - fs.readFile() for reading file contents asynchronously
 * - path.join() for building secure file paths
 * - Input validation, HTML sanitization, and directory traversal security
 * ============================================================================
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Path to the tasks storage directory
const tasksDirectory = path.join(__dirname, 'tasks');

// Ensure the "tasks" directory exists automatically on startup
if (!fs.existsSync(tasksDirectory)) {
  fs.mkdirSync(tasksDirectory, { recursive: true });
}

// ============================================================================
// Middleware Setup
// ============================================================================

// Serve static assets (CSS, images) from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Required Express Concept: Parse incoming HTML form submissions into req.body
app.use(express.urlencoded({ extended: true }));

// ============================================================================
// Helper & Security Functions
// ============================================================================

/**
 * Escapes unsafe HTML characters to prevent Cross-Site Scripting (XSS).
 * @param {string} str - Raw text string
 * @returns {string} Sanitized HTML-safe string
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Truncates text to a specified maximum length with ellipsis for card previews.
 * @param {string} text - The input description text
 * @param {number} maxLength - Character threshold
 * @returns {string} Shortened text preview
 */
function shortenDescription(text, maxLength = 110) {
  if (!text) return 'No description provided.';
  const singleLine = text.replace(/\s+/g, ' ').trim();
  if (singleLine.length <= maxLength) return singleLine;
  return singleLine.substring(0, maxLength) + '...';
}

/**
 * Validates a filename to prevent directory traversal and unauthorized file access.
 * Enforces basename check and .txt extension.
 * @param {string} filename - Filename from req.params
 * @returns {boolean} True if safe, false otherwise
 */
function isSafeFilename(filename) {
  if (!filename || typeof filename !== 'string') return false;
  
  // Reject directory traversal attempts and dangerous characters
  if (
    filename.includes('..') ||
    filename.includes('/') ||
    filename.includes('\\') ||
    filename.includes('\0')
  ) {
    return false;
  }

  // Must strictly end with .txt
  if (!filename.toLowerCase().endsWith('.txt')) {
    return false;
  }

  // Filename must equal its basename
  if (path.basename(filename) !== filename) {
    return false;
  }

  // Verify resolved path stays strictly within the tasks directory
  const resolvedPath = path.resolve(tasksDirectory, filename);
  const resolvedBase = path.resolve(tasksDirectory) + path.sep;
  if (!resolvedPath.startsWith(resolvedBase)) {
    return false;
  }

  return true;
}

/**
 * Parses task file contents into a title and description.
 * Supports structured "Title: ... \n\n Description: ..." format
 * as well as plain text files (where line 1 is title and rest is description).
 * @param {string} content - Raw text from the file
 * @returns {{ title: string, description: string }}
 */
function parseTaskFile(content) {
  const normalized = (content || '').replace(/\r\n/g, '\n');

  // Check for explicit "Title: ..." and "Description: ..." structure
  const titleMatch = normalized.match(/^Title:\s*(.*?)(?:\n|$)/i);
  const descMatch = normalized.match(/(?:^|\n)Description:\s*([\s\S]*)$/i);

  if (titleMatch && descMatch) {
    return {
      title: titleMatch[1].trim() || 'Untitled Task',
      description: descMatch[1].trim()
    };
  }

  // Fallback: Line 1 is title, remaining lines form description
  const lines = normalized.split('\n');
  const title = (lines[0] || '').trim() || 'Untitled Task';
  const description = lines.slice(1).join('\n').trim();

  return { title, description };
}

// ============================================================================
// HTML Page Layout Templates
// ============================================================================

/**
 * Wraps content in the standard TaskFlow page layout with header and footer.
 */
function renderLayout(title, content, activeNav = 'home') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} – TaskFlow</title>
  <meta name="description" content="TaskFlow - Modern Task Manager Web Application powered by Node.js, Express.js, and File System storage.">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <!-- Global Application Header -->
  <header class="site-header">
    <div class="container header-inner">
      <a href="/" class="brand" title="TaskFlow Home">
        <div class="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <div class="brand-text">
          <span class="brand-name">TaskFlow</span>
          <span class="brand-tagline">Task Manager</span>
        </div>
      </a>
      <nav>
        <a href="/create" class="btn btn-primary" id="btn-add-task">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Task
        </a>
      </nav>
    </div>
  </header>

  <!-- Main Content Area -->
  <main class="main-content">
    <div class="container">
      ${content}
    </div>
  </main>

  <!-- Application Footer -->
  <footer class="site-footer">
    <div class="container footer-inner">
      <div>
        <strong>TaskFlow</strong> &copy; ${new Date().getFullYear()} &bull; Assignment Project
      </div>
      <div class="footer-tech">
        <span>Node.js</span> &bull; 
        <span>Express.js</span> &bull; 
        <span>FS Module (.txt)</span>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

// ============================================================================
// Application Routes
// ============================================================================

/**
 * Route: GET /
 * Purpose: Display all saved tasks stored inside the "tasks" directory.
 * Concepts: fs.readdir(), fs.readFile(), path.join()
 */
app.get('/', (req, res) => {
  // Read all filenames from the "tasks" directory asynchronously
  fs.readdir(tasksDirectory, (err, files) => {
    if (err) {
      console.error('Error reading tasks directory:', err);
      const errorContent = `
        <div class="alert alert-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          Unable to access the tasks directory. Please verify server permissions.
        </div>
      `;
      return res.status(500).send(renderLayout('Error', errorContent));
    }

    // Filter to include only .txt files
    const txtFiles = (files || []).filter(file => file.toLowerCase().endsWith('.txt'));

    // Check if tasks directory is empty
    if (txtFiles.length === 0) {
      let bannerHtml = '';
      if (req.query.success === 'created') {
        bannerHtml = `
          <div class="alert alert-success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Task created successfully!
          </div>
        `;
      }

      const emptyHtml = `
        ${bannerHtml}
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h2 class="empty-state-title">No tasks available yet</h2>
          <p class="empty-state-text">Your task list is empty. Get started by creating your very first task file!</p>
          <a href="/create" class="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Your First Task
          </a>
        </div>
      `;
      return res.send(renderLayout('All Tasks', emptyHtml));
    }

    // Read each file asynchronously using fs.readFile()
    let completedCount = 0;
    const taskList = [];

    txtFiles.forEach(file => {
      const filePath = path.join(tasksDirectory, file);

      fs.readFile(filePath, 'utf8', (readErr, content) => {
        completedCount++;

        if (!readErr) {
          const parsed = parseTaskFile(content);
          taskList.push({
            filename: file,
            title: parsed.title,
            description: parsed.description,
            shortDescription: shortenDescription(parsed.description)
          });
        }

        // Once all task files have been processed, render the home page
        if (completedCount === txtFiles.length) {
          // Sort tasks newest first if filenames contain timestamps, otherwise alphabetically
          taskList.sort((a, b) => b.filename.localeCompare(a.filename));

          let alertBanner = '';
          if (req.query.success === 'created') {
            alertBanner = `
              <div class="alert alert-success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Task created and saved successfully to file storage!
              </div>
            `;
          } else if (req.query.error === 'notfound') {
            alertBanner = `
              <div class="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                The requested task file was not found.
              </div>
            `;
          } else if (req.query.error === 'invalid') {
            alertBanner = `
              <div class="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                Invalid task file identifier requested.
              </div>
            `;
          }

          const cardsHtml = taskList.map(task => `
            <article class="task-card">
              <div class="task-card-header">
                <span class="task-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  .txt
                </span>
                <span class="task-file-meta" title="${escapeHtml(task.filename)}">${escapeHtml(task.filename)}</span>
              </div>
              <h3 class="task-title">${escapeHtml(task.title)}</h3>
              <p class="task-description">${escapeHtml(task.shortDescription)}</p>
              <div class="task-card-footer">
                <a href="/task/${encodeURIComponent(task.filename)}" class="btn-read-more" id="btn-read-more-${escapeHtml(task.filename.replace(/[^a-zA-Z0-9]/g, '-'))}">
                  Read More
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
              </div>
            </article>
          `).join('');

          const homeContent = `
            ${alertBanner}
            <div class="page-header">
              <h1 class="page-title">Saved Tasks</h1>
              <p class="page-subtitle">Showing all tasks saved as individual .txt files (${taskList.length} total)</p>
            </div>
            <div class="tasks-grid">
              ${cardsHtml}
            </div>
          `;

          res.send(renderLayout('All Tasks', homeContent));
        }
      });
    });
  });
});

/**
 * Route: GET /create
 * Purpose: Display the task creation form with Task Title and Task Description fields.
 */
app.get('/create', (req, res) => {
  let errorBanner = '';
  if (req.query.error === 'empty') {
    errorBanner = `
      <div class="alert alert-error">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        Both Task Title and Task Description are required. Please fill in both fields.
      </div>
    `;
  } else if (req.query.error === 'save_failed') {
    errorBanner = `
      <div class="alert alert-error">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        Failed to save task to disk. Please try again.
      </div>
    `;
  }

  const formContent = `
    <div class="details-nav">
      <a href="/" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Tasks
      </a>
    </div>

    ${errorBanner}

    <section class="form-card">
      <div class="form-header">
        <h1 class="form-title">Create New Task</h1>
        <p class="form-subtitle">Fill in the details below. The task will be saved as an individual .txt file on the server.</p>
      </div>

      <form action="/create" method="POST" id="task-form">
        <div class="form-group">
          <label for="title" class="form-label">
            Task Title <span class="required-star">*</span>
          </label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            class="form-input" 
            placeholder="e.g. Complete Node.js & Express Assignment" 
            required 
            autofocus
            maxlength="150"
          >
          <p class="form-hint">A concise, descriptive headline for this task.</p>
        </div>

        <div class="form-group">
          <label for="description" class="form-label">
            Task Description <span class="required-star">*</span>
          </label>
          <textarea 
            id="description" 
            name="description" 
            class="form-textarea" 
            placeholder="Write complete task details, notes, or instructions here..." 
            required
            rows="6"
          ></textarea>
          <p class="form-hint">Detailed task instructions. Line breaks and spacing will be preserved.</p>
        </div>

        <div class="form-actions">
          <a href="/" class="btn btn-secondary">Cancel</a>
          <button type="submit" class="btn btn-primary" id="btn-submit-task">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Create Task
          </button>
        </div>
      </form>
    </section>
  `;

  res.send(renderLayout('Create New Task', formContent, 'create'));
});

/**
 * Route: POST /create
 * Purpose: Receive form data, validate input, and save the task as an individual .txt file.
 * Concepts: req.body, fs.writeFile(), path.join()
 */
app.post('/create', (req, res) => {
  // Required Express Concept: Access submitted form data via req.body
  const rawTitle = req.body.title;
  const rawDescription = req.body.description;

  const title = (typeof rawTitle === 'string') ? rawTitle.trim() : '';
  const description = (typeof rawDescription === 'string') ? rawDescription.trim() : '';

  // Validation: Both fields are required and must not be empty
  if (!title || !description) {
    return res.redirect('/create?error=empty');
  }

  // Generate a clean slug from the title (alphanumeric and hyphens only)
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'task';

  // Generate a unique filename using timestamp to prevent accidental overwrites
  const timestamp = Date.now();
  const filename = `${slug}-${timestamp}.txt`;

  // Required Concept: path.join() to construct secure filesystem path
  const filePath = path.join(tasksDirectory, filename);

  // Format file contents: Title on top, followed by Description
  const fileContent = `Title: ${title}\n\nDescription:\n${description}\n`;

  // Required Concept: fs.writeFile() for asynchronous file creation and writing
  fs.writeFile(filePath, fileContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing task file:', err);
      return res.redirect('/create?error=save_failed');
    }

    console.log(`[TaskFlow] Successfully created task file: ${filename}`);

    // Redirect user to the homepage after successful creation with confirmation
    res.redirect('/?success=created');
  });
});

/**
 * Route: GET /task/:filename
 * Purpose: Display the complete details of a specific task.
 * Concepts: req.params, fs.readFile(), path.join()
 */
app.get('/task/:filename', (req, res) => {
  // Required Express Concept: Retrieve the filename from the dynamic route parameter
  const filename = req.params.filename;

  // Security check: Reject directory traversal or unsafe filenames
  if (!isSafeFilename(filename)) {
    return res.redirect('/?error=invalid');
  }

  // Required Concept: path.join() to locate the file inside "tasks" directory
  const filePath = path.join(tasksDirectory, filename);

  // Required Concept: fs.readFile() for reading file contents asynchronously
  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File does not exist
        return res.redirect('/?error=notfound');
      }

      console.error(`Error reading task file ${filename}:`, err);
      const serverErrorHtml = `
        <div class="alert alert-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          An unexpected error occurred while reading the task file.
        </div>
        <div style="text-align: center; margin-top: 2rem;">
          <a href="/" class="btn btn-primary">Back to Tasks</a>
        </div>
      `;
      return res.status(500).send(renderLayout('Error Reading Task', serverErrorHtml));
    }

    // Parse the stored task content
    const parsed = parseTaskFile(content);

    // Calculate details statistics
    const wordCount = parsed.description.trim().split(/\s+/).filter(Boolean).length;
    const charCount = parsed.description.length;

    const detailsContent = `
      <div class="details-nav">
        <a href="/" class="back-link" id="btn-back-to-tasks">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Tasks
        </a>
      </div>

      <article class="details-card">
        <header class="details-header">
          <h1 class="details-title">${escapeHtml(parsed.title)}</h1>
          <div class="details-meta">
            <span class="meta-pill" title="File Storage Location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              tasks/${escapeHtml(filename)}
            </span>
            <span class="meta-pill">
              ${wordCount} ${wordCount === 1 ? 'word' : 'words'} &bull; ${charCount} chars
            </span>
          </div>
        </header>

        <section>
          <div class="details-body">${escapeHtml(parsed.description)}</div>
        </section>

        <footer class="details-actions">
          <a href="/" class="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Tasks
          </a>
          <a href="/create" class="btn btn-outline-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Another Task
          </a>
        </footer>
      </article>
    `;

    res.send(renderLayout(parsed.title, detailsContent));
  });
});

// ============================================================================
// 404 Route Catch-all
// ============================================================================
app.use((req, res) => {
  const notFoundHtml = `
    <div class="empty-state">
      <h2 class="empty-state-title">404 – Page Not Found</h2>
      <p class="empty-state-text">The page you are looking for does not exist.</p>
      <a href="/" class="btn btn-primary">Return to Homepage</a>
    </div>
  `;
  res.status(404).send(renderLayout('Page Not Found', notFoundHtml));
});

// ============================================================================
// Start Server
// ============================================================================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🚀 TaskFlow Server is running on http://localhost:${PORT}`);
    console.log(`📁 Tasks storage directory: ${tasksDirectory}`);
    console.log('====================================================');
  });
}

module.exports = app;
