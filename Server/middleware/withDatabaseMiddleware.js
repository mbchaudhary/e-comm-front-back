const database = require('../config/db');

/**
 * Middleware to handle database connection and release automatically
 * @param {function} controller - The controller function to wrap
 * @returns {function} - The wrapped controller function
 */

function withDatabaseMiddleware(controller) {
  return async (req, res, next) => {
    const db = await database.getConnection();
    req.db = db;

    try {
      await controller(req, res);
    } catch (err) {
      next(err);
    } finally {
      db.release();
    }
  };
}

module.exports = withDatabaseMiddleware;