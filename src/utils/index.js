/**
 * Utility functions for common operations
 * Helpers for error handling, formatting, logging, password hashing, JWT, etc.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Format API response consistently
 * @param {boolean} success - Success flag
 * @param {string} message - Response message
 * @param {*} data - Response data (optional)
 * @returns {Object} Formatted response
 */
const formatResponse = (success, message, data = null) => {
  const response = {
    success,
    message,
  };
  if (data !== null) {
    response.data = data;
  }
  return response;
};

/**
 * Create custom error with status code
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Error} Error object with statusCode
 */
const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Hash a plain text password using bcrypt
 * Uses salt rounds of 10 for security-performance balance
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 * @throws {Error} If hashing fails
 */
const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
};

/**
 * Compare a plain text password with a hashed password
 * Used during login to verify user credentials
 * @param {string} plainPassword - Plain text password from user input
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 * @throws {Error} If comparison fails
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error(`Password comparison failed: ${error.message}`);
  }
};

/**
 * Generate a JWT access token
 * Encodes userId and role for stateless authentication
 * @param {string} userId - User MongoDB ObjectId
 * @param {string} role - User role (ADMIN or USER)
 * @returns {string} Signed JWT token
 * @throws {Error} If token generation fails
 */
const generateToken = (userId, role) => {
  try {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRY || '7d';

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const token = jwt.sign(
      {
        userId,
        role,
      },
      secret,
      {
        expiresIn,
      }
    );

    return token;
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

/**
 * Verify and decode a JWT token
 * Validates token signature and expiry
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload { userId, role, iat, exp }
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

module.exports = {
  formatResponse,
  createError,
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
};
