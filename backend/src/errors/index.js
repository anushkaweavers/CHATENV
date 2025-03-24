class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = '') {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = isOperational;
      if (stack) {
        this.stack = stack;
      } else {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  
  class BadRequestError extends ApiError {
    constructor(message = 'Bad Request') {
      super(400, message);
    }
  }
  
  class NotFoundError extends ApiError {
    constructor(message = 'Not Found') {
      super(404, message);
    }
  }
  
  class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized') {
      super(401, message);
    }
  }
  
  class ForbiddenError extends ApiError {
    constructor(message = 'Forbidden') {
      super(403, message);
    }
  }
  
  module.exports = {
    ApiError,
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError
  };