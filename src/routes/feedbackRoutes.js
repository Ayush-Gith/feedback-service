/**
 * Feedback routes
 * Handles feedback submission and retrieval endpoints
 */

const express = require('express');
const { validationResult } = require('express-validator');
const feedbackController = require('../controllers/feedbackController');
const { validateFeedbackSubmit, validateFeedbackFetch } = require('../validators/feedbackValidator');
const { authenticate } = require('../middlewares/authenticate');
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
 * /feedback:
 *   get:
 *     summary: Get feedback with pagination and filters
 *     description: Retrieve feedback. Admins see all feedback, users see only their own
 *     tags:
 *       - Feedback
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3, 4, 5]
 *         description: Filter by rating
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [web, mobile, email, in-person]
 *         description: Filter by source channel
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
 *         description: Feedback retrieved successfully
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
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Feedback'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: Unauthorized - missing or invalid token
 */
router.get(
  '/',
  authenticate,
  validateFeedbackFetch,
  handleValidationErrors,
  feedbackController.getFeedbackHandler
);

/**
 * @openapi
 * /feedback:
 *   post:
 *     summary: Submit new feedback
 *     description: Create and submit customer feedback with rating and comment
 *     tags:
 *       - Feedback
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *               - source
 *             properties:
 *               rating:
 *                 type: integer
 *                 enum: [1, 2, 3, 4, 5]
 *                 example: 5
 *               comment:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 1000
 *                 example: "Great service and support!"
 *               source:
 *                 type: string
 *                 enum: [web, mobile, email, in-person]
 *                 example: "web"
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Feedback'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - missing or invalid token
 */
router.post(
  '/',
  authenticate,
  validateFeedbackSubmit,
  handleValidationErrors,
  feedbackController.submitFeedbackHandler
);

module.exports = router;
