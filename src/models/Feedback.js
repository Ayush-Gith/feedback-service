/**
 * Feedback Model
 * Represents customer feedback with rating, comment, and source tracking
 */

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      minlength: [3, 'Comment must be at least 3 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    source: {
      type: String,
      enum: {
        values: ['web', 'mobile', 'email', 'in-person'],
        message: 'Source must be one of: web, mobile, email, in-person',
      },
      required: [true, 'Source is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

/**
 * Indexes
 * rating: Index for filtering and aggregating feedback by rating
 *   - Enables fast range queries (e.g., find all ratings >= 4)
 *   - Essential for analytics: average rating, rating distribution
 *
 * createdBy: Index for finding feedback submitted by a specific user
 *   - Enables fast lookups of user's feedback history
 *
 * source: Index for filtering feedback by source channel
 *   - Analytics by channel (which source gives best feedback?)
 *
 * createdAt: Index for time-based queries and sorting
 *   - Enables fast date range filtering (e.g., last 30 days)
 *   - Essential for pagination and sorting
 *
 * Compound index (rating, createdAt): Optimizes sorting and filtering together
 *   - Example: Get all 5-star ratings from last week, sorted by date
 */
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ createdBy: 1 });
feedbackSchema.index({ source: 1 });
feedbackSchema.index({ createdAt: -1 }); // Descending for recent-first queries
feedbackSchema.index({ rating: 1, createdAt: -1 }); // Compound index for analytics

/**
 * TTL Index (optional for future use)
 * Automatically deletes feedback older than 2 years
 * Commented out for now—enable when retention policy is finalized
 * feedbackSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });
 */

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
