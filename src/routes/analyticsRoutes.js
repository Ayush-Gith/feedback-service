/**
 * Analytics routes
 * Handles admin analytics endpoints
 */

const express = require('express');
const { validationResult } = require('express-validator');
const analyticsController = require('../controllers/analyticsController');
const { validateFeedbackPerDay } = require('../validators/analyticsValidator');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const { formatResponse } = require('../utils');

const router = express.Router();

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(
      formatResponse(
        false,
        'Validation error',
        errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        }))
      )
    );
  }
  next();
};

/**
 * @openapi
 * /analytics/average-rating:
 *   get:
 *     summary: Get average rating across all feedback
 *     description: Calculate average, min, max ratings and total feedback count. Admin only
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Average rating retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     averageRating:
 *                       type: number
 *                       format: float
 *                       example: 4.25
 *                     totalFeedback:
 *                       type: integer
 *                       example: 100
 *                     minRating:
 *                       type: integer
 *                       example: 1
 *                     maxRating:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 */
router.get(
  '/average-rating',
  authenticate,
  authorize('ADMIN'),
  analyticsController.getAverageRatingHandler
);

/**
 * @openapi
 * /analytics/feedback-per-day:
 *   get:
 *     summary: Get feedback count per day
 *     description: Retrieve daily feedback counts and average ratings. Admin only
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Feedback per day retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2025-01-15"
 *                       count:
 *                         type: integer
 *                         example: 25
 *                       averageRating:
 *                         type: number
 *                         format: float
 *                         example: 4.2
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 */
router.get(
  '/feedback-per-day',
  authenticate,
  authorize('ADMIN'),
  validateFeedbackPerDay,
  handleValidationErrors,
  analyticsController.getFeedbackPerDayHandler
);

module.exports = router;
