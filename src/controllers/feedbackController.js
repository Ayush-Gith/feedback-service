/**
 * Feedback controller
 * Handles feedback HTTP requests and responses
 */

const { submitFeedback, getFeedback } = require('../services/feedbackService');
const { formatResponse } = require('../utils');

/**
 * Submit feedback
 * POST /api/feedback
 * Authenticated users only
 */
const submitFeedbackHandler = async (req, res, next) => {
  try {
    const { rating, comment, source } = req.body;
    const userId = req.user.id; // From JWT middleware

    // Call service layer
    const feedback = await submitFeedback(userId, rating, comment, source);

    res.status(201).json(
      formatResponse(true, 'Feedback submitted successfully', feedback)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get feedback with pagination and filters
 * GET /api/feedback
 * Authenticated users only
 * Admins see all feedback, users see only their own
 */
const getFeedbackHandler = async (req, res, next) => {
  try {
    const userId = req.user.id; // From JWT middleware
    const userRole = req.user.role; // From JWT middleware

    // Extract query parameters
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const rating = req.query.rating ? parseInt(req.query.rating) : undefined;
    const source = req.query.source;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    // Call service layer
    const result = await getFeedback(userId, userRole, {
      page,
      limit,
      rating,
      source,
      startDate,
      endDate,
    });

    res.status(200).json(
      formatResponse(true, 'Feedback retrieved successfully', result)
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitFeedbackHandler,
  getFeedbackHandler,
};
