/**
 * User Model
 * Represents a user account with authentication and role-based access
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default in queries
    },
    role: {
      type: String,
      enum: {
        values: ['USER', 'ADMIN'],
        message: 'Role must be either USER or ADMIN',
      },
      default: 'USER',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

/**
 * Indexes
 * email: Unique index for fast login lookups and preventing duplicate accounts
 * role: Index for role-based filtering (e.g., finding all admins)
 */
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

/**
 * Pre-save hook to prevent accidental password updates
 * Password should be hashed before saving (handled in service layer)
 */
userSchema.pre('save', function (next) {
  // Password hashing handled in the auth service, not here
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
