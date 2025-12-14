/**
 * JWT authentication middleware
 * Verifies JWT token from Authorization header and attaches user info to request
 */

const { verifyToken } = require('../utils');
const { formatResponse } = require('../utils');

/**
 * Authenticate request with JWT token
 * Expects token in Authorization header: "Bearer <token>"
 * Attaches decoded user info to req.user on success
 */
const authenticate = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json(
        formatResponse(false, 'Authorization header is missing')
      );
    }

    // Expected format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return res.status(401).json(
        formatResponse(false, 'Invalid authorization header format')
      );
    }

    const token = parts[1];

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request object
    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json(
      formatResponse(false, error.message || 'Authentication failed')
    );
  }
};

module.exports = {
  authenticate,
};
