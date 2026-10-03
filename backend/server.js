const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');
const path = require('path');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables from .env
dotenv.config();

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB();

// ---------------------------------------------------------------------------
// Security & Middleware Configuration
// ---------------------------------------------------------------------------

// Configurable CORS origins
const rawAllowedOrigins = process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173,http://localhost:5500,http://localhost:9000';
const allowedOrigins = rawAllowedOrigins.split(',').map(o => o.trim());

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS policy`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// JSON Body Parser with body-size limiting (Security Requirement 19)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// ---------------------------------------------------------------------------
// Serve Frontend Static Files
// ---------------------------------------------------------------------------
const frontendDir = path.join(__dirname, '..');
app.use(express.static(frontendDir));

// ---------------------------------------------------------------------------
// Health Check Endpoint (Requirement 3)
// ---------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running'
  });
});

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------
app.use('/api/tasks', taskRoutes);

// Root route handler for frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// ---------------------------------------------------------------------------
// Centralized Error Handling & 404
// ---------------------------------------------------------------------------
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Tasks API:   http://localhost:${PORT}/api/tasks`);
  console.log(`=========================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]', err.message);
});

module.exports = { app, server };
