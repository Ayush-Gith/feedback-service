/**
 * Input validation schemas
 * Reusable validation rules for request data
 */

const { body, param, query } = require('express-validator');

/**
 * Health check validation (if needed for future GET params)
 */
const validateHealthCheck = [
  query('detailed')
    .optional()
    .isBoolean()
    .withMessage('detailed must be a boolean'),
];

module.exports = {
  validateHealthCheck,
  // Additional validators will be added here
  // Examples: validateUserRegister, validateFeedbackSubmit, etc.
};
