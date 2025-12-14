/**
 * Feedback service
 * Handles feedback submission and retrieval
 */

const { Feedback } = require('../models');
const { createError } = require('../utils');

/**
 * Submit feedback
 * @param {string} userId - User MongoDB ObjectId who submitted feedback
 * @param {number} rating - Rating 1-5
 * @param {string} comment - Feedback comment
 * @param {string} source - Source channel (web, mobile, email, in-person)
 * @returns {Object} Created feedback object
 * @throws {Error} If validation or save fails
 */
const submitFeedback = async (userId, rating, comment, source) => {
  try {
    const feedback = new Feedback({
      rating,
      comment,
      source,
      createdBy: userId,
    });

    await feedback.save();

    // Populate user reference for response
    await feedback.populate('createdBy', 'name email');

    return {
      id: feedback._id,
      rating: feedback.rating,
      comment: feedback.comment,
      source: feedback.source,
      createdBy: feedback.createdBy,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get feedback with pagination and filters
 * Admins see all feedback, users see only their own
 * @param {string} userId - User MongoDB ObjectId requesting feedback
 * @param {string} userRole - User role (ADMIN or USER)
 * @param {Object} options - Filter and pagination options
 * @param {number} options.page - Page number (default 1)
 * @param {number} options.limit - Items per page (default 10)
 * @param {number} options.rating - Filter by rating (optional)
 * @param {string} options.source - Filter by source (optional)
 * @param {string} options.startDate - Filter from date (optional)
 * @param {string} options.endDate - Filter to date (optional)
 * @returns {Object} Paginated feedback results with metadata
 * @throws {Error} If query fails
 */
const getFeedback = async (userId, userRole, options = {}) => {
  try {
    // Extract pagination and filter options
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    // Build filter query
    const query = {};

    // RBAC: Users see only their own feedback, admins see all
    if (userRole === 'USER') {
      query.createdBy = userId;
    }

    // Rating filter
    if (options.rating) {
      query.rating = options.rating;
    }

    // Source filter
    if (options.source) {
      query.source = options.source;
    }

    // Date range filter
    if (options.startDate || options.endDate) {
      query.createdAt = {};
      if (options.startDate) {
        query.createdAt.$gte = new Date(options.startDate);
      }
      if (options.endDate) {
        query.createdAt.$lte = new Date(options.endDate);
      }
    }

    // Execute optimized query
    // .select() to exclude unnecessary fields
    // .populate() to get user details
    // .sort() by recent first (matches index on createdAt DESC)
    // .lean() for read-only operations (performance boost)
    const feedbacks = await Feedback.find(query)
      .select('_id rating comment source createdAt updatedAt createdBy')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination metadata
    const total = await Feedback.countDocuments(query);

    return {
      data: feedbacks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  submitFeedback,
  getFeedback,
};
