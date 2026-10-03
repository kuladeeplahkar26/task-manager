const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Uses MONGODB_URI from environment variables or defaults to local MongoDB
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task_dashboard';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`------------------------------------------------------------------`);
    console.warn(`[Database Notice] Unable to connect to MongoDB at:`);
    console.warn(`  ${uri}`);
    console.warn(`  Reason: ${error.message}`);
    console.warn(`  To connect with MongoDB:`);
    console.warn(`  1. Ensure MongoDB service is running (e.g. Windows Service or 'mongod')`);
    console.warn(`  2. Or set MONGODB_URI in backend/.env to your MongoDB Atlas connection string`);
    console.warn(`------------------------------------------------------------------`);
    return null;
  }
};

/**
 * Disconnect helper
 */
const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('[Database] MongoDB disconnected cleanly');
    }
  } catch (err) {
    console.error('[Database] Disconnect error:', err.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
