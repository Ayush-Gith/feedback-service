/**
 * Auth service
 * Handles user registration, login, and token generation
 */

const { User } = require('../models');
const { hashPassword, comparePassword, generateToken } = require('../utils');
const { createError } = require('../utils');

/**
 * Register a new user
 * @param {string} name - User name
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @returns {Object} New user object (without password)
 * @throws {Error} If email already exists or validation fails
 */
const register = async (name, email, password) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError('Email already registered', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'USER', // Default role
    });

    await newUser.save();

    // Return user without password
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    return userResponse;
  } catch (error) {
    throw error;
  }
};

/**
 * Login user and generate JWT token
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @returns {Object} User object and JWT token
 * @throws {Error} If credentials are invalid
 */
const login = async (email, password) => {
  try {
    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw createError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.role);

    // Return user (without password) and token
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return {
      user: userResponse,
      token,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  register,
  login,
};
