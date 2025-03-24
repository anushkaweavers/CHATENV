const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const ApiError = require('../utils/ApiError');
const saltRounds = 8;
/**
 * User Schema
 */
const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
      trim: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Other',
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  }
);

/**
 * Static method to check if email is already taken.
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};
userSchema.pre('save', async function (next) {
  // Only hash the password if it's a new password or has been modified
  if (this.isModified('password')) {
    this.passwordHash = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

userSchema.methods.isPasswordMatch = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};


userSchema.methods.isPasswordMatch = async function (password) {
  console.log('Comparing plain password:', password);
  console.log('With hashed password:', this.passwordHash);
  const result = await bcrypt.compare(password, this.passwordHash);
  console.log('Password comparison result:', result);
  return result;
};


module.exports = mongoose.model('User', userSchema);