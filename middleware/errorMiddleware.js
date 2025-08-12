const logger = require('../config/logger');
const { AppError, ErrorCodes } = require('../utils/AppError');

class ErrorHandler {
  // PostgreSQL error codes
  static PG_ERROR_CODES = {
    UNIQUE_VIOLATION: '23505',
    FOREIGN_KEY_VIOLATION: '23503',
    NOT_NULL_VIOLATION: '23502',
    INVALID_TEXT_REPRESENTATION: '22P02',
    UNDEFINED_COLUMN: '42703'
  };

  constructor() {
    this.handleError = this.handleError.bind(this);
  }

  handleValidationError(err) {
    return new AppError(
      err.details ? err.details.map(detail => detail.message).join(', ') : 'Validation error',
      ErrorCodes.VALIDATION_ERROR.code
    );
  }

  handleDatabaseError(err) {
    switch (err.code) {
      case this.constructor.PG_ERROR_CODES.UNIQUE_VIOLATION:
        return new AppError(
          'A record with this value already exists',
          ErrorCodes.CONFLICT.code
        );
      
      case this.constructor.PG_ERROR_CODES.FOREIGN_KEY_VIOLATION:
        return new AppError(
          'Referenced record does not exist',
          ErrorCodes.BAD_REQUEST.code
        );
      
      case this.constructor.PG_ERROR_CODES.NOT_NULL_VIOLATION:
        return new AppError(
          'Required field is missing',
          ErrorCodes.BAD_REQUEST.code
        );
      
      case this.constructor.PG_ERROR_CODES.INVALID_TEXT_REPRESENTATION:
        return new AppError(
          'Invalid data format',
          ErrorCodes.BAD_REQUEST.code
        );
      
      default:
        return new AppError(
          'Database error occurred',
          ErrorCodes.INTERNAL_SERVER.code
        );
    }
  }

  handleJWTError(err) {
    if (err.name === 'JsonWebTokenError') {
      return new AppError(
        'Invalid token. Please log in again',
        ErrorCodes.UNAUTHORIZED.code
      );
    }
    if (err.name === 'TokenExpiredError') {
      return new AppError(
        'Your token has expired. Please log in again',
        ErrorCodes.UNAUTHORIZED.code
      );
    }
    return err;
  }

  formatError(err) {
    return {
      success: false,
      status: err.status,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && {
        error: err,
        stack: err.stack
      })
    };
  }

  handleError(err, req, res, next) {
    // Skip logging for path-to-regexp errors during development
    if (!err.message.includes('path-to-regexp')) {
      logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
      });
    }

    let error = err;

    // Handle path-to-regexp errors
    if (err instanceof TypeError && err.message.includes('Missing parameter name')) {
      error = new AppError('Invalid route configuration', ErrorCodes.INTERNAL_SERVER.code);
      return res.status(error.statusCode).json(this.formatError(error));
    }

    // Handle different types of errors
    if (err.isJoi) {
      error = this.handleValidationError(err);
    } else if (err.code) {
      error = this.handleDatabaseError(err);
    } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      error = this.handleJWTError(err);
    } else if (!err.statusCode) {
      error = new AppError(
        err.message || 'Internal server error',
        ErrorCodes.INTERNAL_SERVER.code
      );
    }

    // Set default status code if none exists
    const statusCode = error.statusCode || ErrorCodes.INTERNAL_SERVER.code;

    // Send response
    res.status(statusCode).json(this.formatError(error));
  }
}

module.exports = new ErrorHandler().handleError;
