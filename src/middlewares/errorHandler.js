/**
 * Centralized error handling middleware
 * Catches and formats all errors with consistent response structure
 */

const errorHandler = (error, req, res, next) => {
  // Log error for debugging
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
  });

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors)
      .map((err) => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: messages,
    });
  }

  // Mongoose cast error (invalid ID format)
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }

  // Generic error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

module.exports = errorHandler;
