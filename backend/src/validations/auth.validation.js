const Joi = require('joi');

const register = {
  body: Joi.object({
    username: Joi.string().required().label("Username"),
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().min(6).required().label("Password"),
  }),
};
const login = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
};  

const logout = {
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};
const resetPassword = {
  body: Joi.object({
    token: Joi.string().required().label("Token"),
    newPassword: Joi.string().min(6).required().label("New Password"),
    confirmPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .required()
      .label("Confirm Password"),
  }),
};

const verifyEmail = {
  query: Joi.object({
    token: Joi.string().required(),
  }),
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
};