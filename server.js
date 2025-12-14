/**
 * Entry point for the Feedback Service backend
 * Initializes database connection and starts HTTP server
 */

require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;
const SERVER_HOST = process.env.SERVER_HOST || 'localhost';

/**
 * Start HTTP server
 */
const server = app.listen(PORT, SERVER_HOST, () => {
  console.log(`✓ Server running on http://${SERVER_HOST}:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

/**
 * Graceful shutdown on SIGTERM
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = server;
