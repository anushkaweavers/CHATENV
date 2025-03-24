const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const { User, SavedMovies, GroupedCollections, Ratings, Posts } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  try {
    const existingUser = await User.findOne({ email: userBody.email });
    if (existingUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exists, try again with a different email');
    }

    const newUser = new User(userBody);
    await newUser.save();
    return newUser;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Duplicate key error: Email already exists');
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'User creation failed');
  }
};
/**
 * Query for users
 * @param {Object} filter - MongoDB filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */

const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  if (updateBody.password) {
    updateBody.passwordHash = await bcrypt.hash(updateBody.password, 8);
    delete updateBody.password;
  }

  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

/**
 * Add saved movie for user
 * @param {ObjectId} userId
 * @param {Object} movieData
 * @returns {Promise<SavedMovies>}
 */
const addSavedMovie = async (userId, movieData) => {
  const savedMovie = new SavedMovies({ userId, ...movieData });
  await savedMovie.save();
  return savedMovie;
};

/**
 * Get saved movies for user
 * @param {ObjectId} userId
 * @returns {Promise<Array<SavedMovies>>}
 */
const getSavedMoviesByUser = async (userId) => {
  return SavedMovies.find({ userId });
};

/**
 * Create grouped collection for user
 * @param {ObjectId} userId
 * @param {Object} groupData
 * @returns {Promise<GroupedCollections>}
 */
const createGroupedCollection = async (userId, groupData) => {
  const groupedCollection = new GroupedCollections({ userId, ...groupData });
  await groupedCollection.save();
  return groupedCollection;
};

/**
 * Add rating for a movie
 * @param {ObjectId} userId
 * @param {Object} ratingData
 * @returns {Promise<Ratings>}
 */
const addRating = async (userId, ratingData) => {
  const rating = new Ratings({ userId, ...ratingData });
  await rating.save();
  return rating;
};

/**
 * Create a post
 * @param {ObjectId} userId
 * @param {Object} postData
 * @returns {Promise<Posts>}
 */
const createPost = async (userId, postData) => {
  const post = new Posts({ userId, ...postData });
  await post.save();
  return post;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  addSavedMovie,
  getSavedMoviesByUser,
  createGroupedCollection,
  addRating,
  createPost,
};