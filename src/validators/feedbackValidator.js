/**
 * Feedback validators
 * Reusable validation rules for feedback endpoints
 */

const { body, query } = require('express-validator');

/**
 * Validation rules for submitting feedback
 */
const validateFeedbackSubmit = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ min: 3, max: 1000 })
    .withMessage('Comment must be between 3 and 1000 characters'),
  body('source')
    .trim()
    .notEmpty()
    .withMessage('Source is required')
    .isIn(['web', 'mobile', 'email', 'in-person'])
    .withMessage('Source must be one of: web, mobile, email, in-person'),
];

/**
 * Validation rules for fetching feedback with filters
 */
const validateFeedbackFetch = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  query('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
    .toInt(),
  query('source')
    .optional()
    .isIn(['web', 'mobile', 'email', 'in-person'])
    .withMessage('Source must be one of: web, mobile, email, in-person'),
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
  validateFeedbackSubmit,
  validateFeedbackFetch,
};
