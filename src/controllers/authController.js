/**
 * Auth controller
 * Handles authentication HTTP requests and responses
 */

const { register: registerService, login: loginService } = require('../services/authService');
const { formatResponse, createError } = require('../utils');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    // Verify passwords match
    if (password !== passwordConfirm) {
      return res.status(400).json(
        formatResponse(false, 'Passwords do not match')
      );
    }

    // Call service layer
    const user = await registerService(name, email, password);

    res.status(201).json(
      formatResponse(true, 'User registered successfully', user)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Call service layer
    const { user, token } = await loginService(email, password);

    res.status(200).json(
      formatResponse(true, 'Login successful', {
        user,
        token,
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
