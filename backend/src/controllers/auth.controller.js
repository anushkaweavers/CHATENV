const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, emailService, tokenService } = require('./../services');
const ApiError = require('../utils/ApiError');
const User = require('../models/user.model'); 
const bcrypt = require('bcryptjs');
const saltRounds = 10; 


const register = catchAsync(async (req, res) => {
  try {
    const user = await userService.createUser({
      ...req.body,
      passwordHash: req.body.password, 
    });

    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.CREATED).json({ user, tokens });

  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message || 'User registration failed',
    });
  }
});


const login = catchAsync(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "Email and password are required" });
    }

const user = await authService.loginUserWithEmailAndPassword(email, password);

    if (!user) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Incorrect email or password" });
    }
  const tokens = await tokenService.generateAuthTokens(user);
    return res.status(httpStatus.OK).json({ user, tokens });
  } catch (error) {
    console.error("❌ Login Error:", error.message);

    return res.status(error.statusCode || httpStatus.UNAUTHORIZED).json({
      message: error.message || "Incorrect email or password",
    });
  }
});

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body; 

    if (!refreshToken) {
      return res.status(400).json({ message: "Token is required" });
    }

    const result = await tokenService.invalidateToken(refreshToken);
    if (!result) {
      return res.status(400).json({ message: "Token invalidation failed" });
    }

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error logging out", error: err.message });
  }
};


// Refresh tokens
const refreshTokens = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Refresh token is required');
  }

  // Verify the refresh token
  const payload = jwt.verify(refreshToken, config.jwt.secret);
  if (payload.type !== tokenTypes.REFRESH) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token type');
  }

  // Check if the refresh token exists in the database and is not invalidated
  const tokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, invalidated: false });
  if (!tokenDoc) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
  }

  // Generate a new access token
  const accessExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(payload.userId, accessExpires, tokenTypes.ACCESS);

  res.send({ accessToken });
});

// Forgot password
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const resetPasswordToken = await tokenService.generateResetPasswordToken(user);
  try {
    await emailService.sendResetPasswordEmail(email, resetPasswordToken);
    res.status(httpStatus.OK).json({
      message: 'Password reset email sent successfully',
      debug: { email, resetPasswordToken }, 
    });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send password reset email');
  }
});

const resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;  // Token is now in the body

  if (!token) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Token is required");
  }

  if (!newPassword || !confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Both passwords are required");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Passwords do not match");
  }

  // Your logic to handle password reset
  const { userId } = await authService.verifyResetPasswordToken(token);
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  await authService.resetPassword(userId, hashedPassword);

  res.status(httpStatus.OK).json({ message: "Password reset successful" });
});

// Send verification email
const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

// Verify email
const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};