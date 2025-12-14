/**
 * Express application setup
 * Configures middleware, routes, database, and error handling
 */

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const connectDB = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/authRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

/**
 * Security and parsing middleware
 */
app.use(helmet()); // HTTP security headers
app.use(express.json({ limit: '10mb' })); // JSON body parser
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL-encoded body parser

/**
 * Rate limiting middleware
 * Global limit: 100 requests per 15 minutes
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(globalLimiter);

/**
 * Database connection
 */
connectDB();

/**
 * API Documentation
 * Swagger UI accessible at /api-docs
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true, // Remember auth token across page reloads
  },
  customCss: '.swagger-ui .topbar { display: none }', // Optional: hide top bar
}));

/**
 * Routes
 */
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
// Additional routes will be added here: users, etc.

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

/**
 * Centralized error handling middleware
 * Must be registered last
 */
app.use(errorHandler);

module.exports = app;
