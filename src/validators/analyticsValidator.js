/**
 * Analytics validators
 * Reusable validation rules for analytics endpoints
 */

const { query } = require('express-validator');

/**
 * Validation rules for fetching feedback per day
 */
const validateFeedbackPerDay = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid ISO8601 date'),
];

module.exports = {
  validateFeedbackPerDay,
};
