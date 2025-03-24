const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const { Token } = require('../models');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');

/**
 * Generate a JWT token.
 * @param {string} userId - The user ID.
 * @param {moment.Moment} expires - Expiration time.
 * @param {string} type - Token type (e.g., ACCESS, REFRESH).
 * @param {string} secret - JWT secret key.
 * @returns {string} - The generated token.
 */
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  const payload = { userId, type, iat: moment().unix(), exp: expires.unix() };
  return jwt.sign(payload, secret);
};

/**
 * Generate authentication tokens (access and refresh tokens).
 * @param {Object} user - The user object.
 * @returns {Promise<Object>} - The generated tokens.
 */
const generateAuthTokens = async (user) => {
  const accessExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user.id, accessExpires, tokenTypes.ACCESS);

  const refreshExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.id, refreshExpires, tokenTypes.REFRESH);

  // Save the refresh token to the database
  await Token.create({ token: refreshToken, user: user.id, type: tokenTypes.REFRESH, expires: refreshExpires.toDate() });

  return { accessToken, refreshToken };
};

/**
 * Invalidate a token by marking it as invalidated in the database.
 * @param {string} token - The token to invalidate.
 * @returns {Promise<boolean>} - True if the token was invalidated successfully.
 * @throws {ApiError} - If the token is already invalidated or an error occurs.
 */
const invalidateToken = async (token) => {
  try {
    const result = await Token.findOneAndUpdate(
      { token, invalidated: { $ne: true } },
      { $set: { invalidated: true, expires: moment().toDate() } },
      { new: true, upsert: false }
    );

    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Token is already invalidated');
    }

    return true;
  } catch (err) {
    console.error('Error invalidating token:', err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error invalidating token');
  }
};

/**
 * Refresh authentication tokens using a valid refresh token.
 * @param {string} refreshToken - The refresh token.
 * @returns {Promise<Object>} - The new access token.
 * @throws {ApiError} - If the refresh token is invalid or expired.
 */
const refreshAuth = async (refreshToken) => {
  try {
    // Verify the refresh token
    const payload = jwt.verify(refreshToken, config.jwt.secret);
    if (payload.type !== tokenTypes.REFRESH) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token type');
    }

    // Check if the token exists in the database and is not invalidated
    const tokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, invalidated: false });
    if (!tokenDoc) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
    }

    // Generate a new access token
    const accessExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const accessToken = generateToken(payload.userId, accessExpires, tokenTypes.ACCESS);

    return { accessToken };
  } catch (error) {
    console.error('Error refreshing token:', error);
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Refresh token has expired');
    }
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
  }
};

/**
 * Generate a reset password token.
 * @param {Object} user - The user object.
 * @returns {Promise<string>} - The generated reset password token.
 */
const generateResetPasswordToken = async (user) => {
  const expires = moment().add(1, 'hour');
  const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);

  await Token.create({
    token: resetPasswordToken,
    user: user.id,
    type: tokenTypes.RESET_PASSWORD,
    expires: expires.toDate(),
  });

  return resetPasswordToken;
};

/**
 * Verify a reset password token.
 * @param {string} token - The reset password token.
 * @returns {Promise<Object>} - The decoded token payload.
 * @throws {ApiError} - If the token is invalid or expired.
 */
const verifyResetPasswordToken = async (token) => {
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    if (payload.type !== tokenTypes.RESET_PASSWORD) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token type');
    }
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Reset password token has expired');
    }
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid reset password token');
  }
};

module.exports = {
  generateToken,
  generateAuthTokens,
  invalidateToken,
  refreshAuth,
  generateResetPasswordToken,
  verifyResetPasswordToken,
};