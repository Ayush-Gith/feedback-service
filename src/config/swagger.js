/**
 * Swagger/OpenAPI configuration
 * Defines API documentation accessible at /api-docs
 */

const swaggerJsdoc = require('swagger-jsdoc');

/**
 * Swagger definition
 * Includes server info, security schemes, and endpoint descriptions
 */
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Feedback Service API',
    version: '1.0.0',
    description: 'Production-ready customer feedback service with JWT authentication and admin analytics',
    contact: {
      name: 'Allen Digitals',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
    {
      url: 'https://api.feedback-service.com/api',
      description: 'Production server',
    },
  ],
  components: {
    // Define reusable response schemas
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['USER', 'ADMIN'] },
        },
      },
      Feedback: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          comment: { type: 'string' },
          source: { type: 'string', enum: ['web', 'mobile', 'email', 'in-person'] },
          createdBy: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errors: { type: 'array', items: { type: 'object' } },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
    },
    // JWT bearer token security scheme
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token from /auth/login endpoint. Include "Bearer <token>" in Authorization header',
      },
    },
  },
  // Global security (can be overridden per endpoint)
  security: [],
};

/**
 * Options for swagger-jsdoc
 * Searches for JSDoc comments in specified files
 */
const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.js', // Scan all route files for JSDoc comments
  ],
};

// Generate OpenAPI specification
const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
