const httpStatus = require('http-status');
const tokenService = require('./token.service');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

const userService = require('./user.service');  // ✅ Ensure this line is present

/**
 * Log in a user with email and password.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Promise<Object>} - The logged-in user object.
 * @throws {ApiError} - If email or password is incorrect.
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  
  console.log("User found:", user); // Debugging line
  console.log("Password provided:", password); // Debugging line

  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return user;
};


/**
 * Log out a user by invalidating their refresh token.
 * @param {string} refreshToken - The refresh token to invalidate.
 * @returns {Promise<void>}
 * @throws {ApiError} - If the refresh token is invalid.
 */
const logout = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Refresh token is required');
  }
  await tokenService.invalidateToken(refreshToken);
};

/**
 * Refresh authentication tokens using a valid refresh token.
 * @param {string} refreshToken - The refresh token.
 * @returns {Promise<Object>} - The new access token.
 * @throws {ApiError} - If the refresh token is invalid or expired.
 */
const refreshAuth = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Refresh token is required');
  }
  return tokenService.refreshAuth(refreshToken);
};

/**
 * Verify a reset password token.
 * @param {string} token - The reset password token.
 * @returns {Promise<Object>} - The decoded token payload.
 * @throws {ApiError} - If the token is invalid or expired.
 */
const verifyResetPasswordToken = async (token) => {
  if (!token) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Token must be provided');
  }
  return tokenService.verifyResetPasswordToken(token);
};

/**
 * Reset a user's password.
 * @param {string} userId - The user ID.
 * @param {string} hashedPassword - The new hashed password.
 * @returns {Promise<void>}
 * @throws {ApiError} - If the user is not found.
 */
const resetPassword = async (userId, hashedPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  user.passwordHash = hashedPassword;
  await user.save();
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  verifyResetPasswordToken,
  resetPassword,
};