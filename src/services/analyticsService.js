/**
 * Analytics service
 * Handles admin analytics queries using MongoDB aggregation pipelines
 */

const { Feedback } = require('../models');

/**
 * Get average rating across all feedback
 * Uses aggregation pipeline to compute average with metadata
 * @returns {Object} Average rating with feedback count
 * @throws {Error} If aggregation fails
 */
const getAverageRating = async () => {
  try {
    // MongoDB aggregation pipeline
    const result = await Feedback.aggregate([
      // Stage 1: Group all documents and compute average, count, min, max
      {
        $group: {
          _id: null, // Group all documents together
          averageRating: { $avg: '$rating' }, // Calculate mean rating
          totalFeedback: { $sum: 1 }, // Count total documents
          minRating: { $min: '$rating' }, // Get lowest rating
          maxRating: { $max: '$rating' }, // Get highest rating
        },
      },
      // Stage 2: Project (reshape) output with rounded average
      {
        $project: {
          _id: 0, // Exclude _id field
          averageRating: { $round: ['$averageRating', 2] }, // Round to 2 decimals
          totalFeedback: 1,
          minRating: 1,
          maxRating: 1,
        },
      },
    ]);

    // Return result or empty object if no feedback exists
    return result.length > 0
      ? result[0]
      : {
          averageRating: 0,
          totalFeedback: 0,
          minRating: null,
          maxRating: null,
        };
  } catch (error) {
    throw error;
  }
};

/**
 * Get feedback count per day for specified date range
 * Uses aggregation pipeline to group by date and sort chronologically
 * @param {string} startDate - ISO8601 start date (optional)
 * @param {string} endDate - ISO8601 end date (optional)
 * @returns {Array} Daily feedback counts sorted by date
 * @throws {Error} If aggregation fails
 */
const getFeedbackPerDay = async (startDate, endDate) => {
  try {
    // Build date match filter
    const matchStage = { $match: {} };
    if (startDate || endDate) {
      matchStage.$match.createdAt = {};
      if (startDate) {
        matchStage.$match.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchStage.$match.createdAt.$lte = new Date(endDate);
      }
    }

    // MongoDB aggregation pipeline
    const result = await Feedback.aggregate([
      // Stage 1: Filter by date range (if provided)
      matchStage,
      // Stage 2: Group by date (truncate time to midnight UTC)
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d', // Format as YYYY-MM-DD
              date: '$createdAt',
            },
          },
          count: { $sum: 1 }, // Count feedback for this day
          averageRating: { $avg: '$rating' }, // Also return daily average rating
        },
      },
      // Stage 3: Sort by date ascending (oldest first)
      {
        $sort: { _id: 1 },
      },
      // Stage 4: Project (reshape) output
      {
        $project: {
          _id: 0,
          date: '$_id', // Rename _id to date
          count: 1,
          averageRating: { $round: ['$averageRating', 2] },
        },
      },
    ]);

    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAverageRating,
  getFeedbackPerDay,
};
