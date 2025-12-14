/**
 * Role-based authorization middleware
 * Checks if user has required role
 */

const { formatResponse } = require('../utils');

/**
 * Authorize user based on required role(s)
 * Must be used after authenticate middleware
 * @param {...string} allowedRoles - One or more allowed roles
 * @returns {Function} Express middleware
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is attached (authenticate middleware must run first)
    if (!req.user) {
      return res.status(401).json(
        formatResponse(false, 'User not authenticated')
      );
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(
        formatResponse(false, 'Insufficient permissions')
      );
    }

    next();
  };
};

module.exports = {
  authorize,
};
