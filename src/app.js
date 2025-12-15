/**
 * Express application setup
 * Configures middleware, routes, database, and error handling
 */

const express = require('express');
const cors = require('cors');
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
// Helmet configuration
// COOP header requires HTTPS or localhost (disable for HTTP)
app.use(helmet({
  crossOriginOpenerPolicy: process.env.NODE_ENV === 'production' && !process.env.ENABLE_HTTP_COOP 
    ? { policy: 'same-origin' } 
    : false, // Disable in development or HTTP
}));

/**
 * CORS configuration
 * Allow requests from all origins (safe for public API)
 * Swagger UI needs this to make requests from browser
 */
app.use(cors({
  origin: '*', // Allow all origins for public API
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false, // Set to true if using cookies
}));

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
