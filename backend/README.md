# Dark-Mode Task Dashboard — REST API Backend

Clean, production-ready Express.js & MongoDB backend prototype for the Dark Mode Task & File Management Dashboard.

---

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB via Mongoose
- **Configuration**: dotenv
- **CORS**: cors
- **Development Tooling**: nodemon

---

## 📂 Project Structure

```
backend/
│
├── server.js              # Express app initialization, middleware, routes
├── package.json           # Dependencies and startup scripts
├── .env                   # Environment variables (git-ignored)
├── .env.example           # Example configuration template
├── .gitignore             # Git ignore file
├── test-api.js            # Automated REST API verification test suite
├── postman_collection.json # Postman / Thunder Client collection import
│
├── config/
│   └── db.js              # MongoDB connection via Mongoose with diagnostics
│
├── models/
│   └── Task.js            # Mongoose Schema & Model with timestamps & indexing
│
├── controllers/
│   └── taskController.js  # CRUD controllers with request validation
│
├── routes/
│   └── taskRoutes.js      # REST API route endpoints
│
├── middleware/
│   └── errorMiddleware.js # Centralized 404 & error handlers (safe JSON)
│
└── utils/
    └── validation.js      # Input validation & MongoDB ObjectId validators
```

---

## 🚀 Getting Started

### 1. Installation

Navigate into the `backend` folder and install dependencies:

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create your `.env` file from the provided `.env.example`:

```bash
cp .env.example .env
```

Your `.env` file includes:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/task_dashboard
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5500,http://localhost:9000
```

> **Note**: Replace `MONGODB_URI` with your MongoDB connection string (e.g., local MongoDB or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)).

### 3. Run the Server

For development with auto-reloading:

```bash
npm run dev
```

For production:

```bash
npm start
```

Server endpoints will be live at:
- **Base URL**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`
- **Tasks Endpoint**: `http://localhost:5000/api/tasks`

---

## 🧪 Automated Testing

A dedicated test suite is included to verify all required endpoint behaviors:

```bash
npm test
```

This runs `test-api.js` testing:
1. Health check (`GET /api/health`)
2. Empty title validation (`POST /api/tasks` -> 400 Bad Request)
3. Empty description validation (`POST /api/tasks` -> 400 Bad Request)
4. Successful task creation (`POST /api/tasks` -> 201 Created)
5. Fetching all tasks (`GET /api/tasks` -> 200 OK, sorted newest first)
6. Fetching single task (`GET /api/tasks/:id` -> 200 OK)
7. Invalid ID format handling (`GET /api/tasks/invalid-id` -> 400 Bad Request)
8. Non-existent task handling (`GET /api/tasks/nonexistent` -> 404 Not Found)
9. Updating a task (`PUT /api/tasks/:id` -> 200 OK)
10. Deleting a task (`DELETE /api/tasks/:id` -> 200 OK)
11. Verifying deletion (`GET /api/tasks/:id` -> 404 Not Found)

---

## 📋 REST API Reference

### Health Check

#### `GET /api/health`
Returns system status.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Backend is running"
}
```

---

### Tasks

#### `GET /api/tasks`
Fetch all tasks, sorted with newest first.

**Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "tasks": [
    {
      "_id": "660c18d7f45a0b1234567890",
      "title": "backend.txt",
      "description": "Backend API development notes",
      "createdAt": "2026-10-03T09:00:00.000Z",
      "updatedAt": "2026-10-03T09:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/tasks`
Create a new task in MongoDB.

**Request Body:**
```json
{
  "title": "nilotpalfrontend.txt",
  "description": "Component design tokens and style guide specifications"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "_id": "660c18d7f45a0b1234567891",
    "title": "nilotpalfrontend.txt",
    "description": "Component design tokens and style guide specifications",
    "createdAt": "2026-10-03T09:01:00.000Z",
    "updatedAt": "2026-10-03T09:01:00.000Z"
  }
}
```

**Validation Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Title and description are required"
}
```

---

#### `GET /api/tasks/:id`
Fetch single task details.

**Response (200 OK):**
```json
{
  "success": true,
  "task": {
    "_id": "660c18d7f45a0b1234567891",
    "title": "nilotpalfrontend.txt",
    "description": "Component design tokens and style guide specifications",
    "createdAt": "2026-10-03T09:01:00.000Z",
    "updatedAt": "2026-10-03T09:01:00.000Z"
  }
}
```

**Not Found Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Task not found"
}
```

---

#### `PUT /api/tasks/:id`
Update an existing task title and/or description.

**Request Body:**
```json
{
  "title": "updated_nilotpalfrontend.txt",
  "description": "Updated design tokens and dark mode palette"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "task": {
    "_id": "660c18d7f45a0b1234567891",
    "title": "updated_nilotpalfrontend.txt",
    "description": "Updated design tokens and dark mode palette",
    "createdAt": "2026-10-03T09:01:00.000Z",
    "updatedAt": "2026-10-03T09:05:00.000Z"
  }
}
```

---

#### `DELETE /api/tasks/:id`
Remove a task from MongoDB.

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## 📬 Postman & Thunder Client Collection

Import `postman_collection.json` into Postman, Thunder Client (VS Code extension), or Insomnia for ready-to-test HTTP requests.
