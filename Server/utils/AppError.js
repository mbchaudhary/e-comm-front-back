class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error codes with messages
const ErrorCodes = {
  BAD_REQUEST: {
    code: 400,
    message: 'Bad Request'
  },
  UNAUTHORIZED: {
    code: 401,
    message: 'Unauthorized Access'
  },
  FORBIDDEN: {
    code: 403,
    message: 'Forbidden Access'
  },
  NOT_FOUND: {
    code: 404,
    message: 'Resource Not Found'
  },
  VALIDATION_ERROR: {
    code: 422,
    message: 'Validation Error'
  },
  CONFLICT: {
    code: 409,
    message: 'Resource Conflict'
  },
  INTERNAL_SERVER: {
    code: 500,
    message: 'Internal Server Error'
  },
  SERVICE_UNAVAILABLE: {
    code: 503,
    message: 'Service Temporarily Unavailable'
  }
};

module.exports = {
  AppError,
  ErrorCodes
};
