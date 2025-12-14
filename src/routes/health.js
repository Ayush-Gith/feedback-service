/**
 * Health check routes
 * Used for monitoring and deployment health verification
 */

const express = require('express');
const router = express.Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns service status and uptime information
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Service is healthy
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
 *                   example: "Service is healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                 environment:
 *                   type: string
 *                   enum: [development, production]
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

module.exports = router;
