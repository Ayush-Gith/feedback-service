/**
 * Analytics controller
 * Handles analytics HTTP requests (admin only)
 */

const { getAverageRating, getFeedbackPerDay } = require('../services/analyticsService');
const { formatResponse } = require('../utils');

/**
 * Get average rating across all feedback
 * GET /api/analytics/average-rating
 * Admin only
 */
const getAverageRatingHandler = async (req, res, next) => {
  try {
    const result = await getAverageRating();

    res.status(200).json(
      formatResponse(true, 'Average rating retrieved successfully', result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get feedback count per day
 * GET /api/analytics/feedback-per-day
 * Admin only
 * Query params: startDate, endDate (optional, ISO8601 format)
 */
const getFeedbackPerDayHandler = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const result = await getFeedbackPerDay(startDate, endDate);

    res.status(200).json(
      formatResponse(true, 'Feedback per day retrieved successfully', result)
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAverageRatingHandler,
  getFeedbackPerDayHandler,
};
