const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Access denied, token missing' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied, token missing' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Optional authentication - allows access with or without token
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    // No token provided, continue without authentication
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    // No token provided, continue without authentication
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Invalid token, continue without authentication
      req.user = null;
      return next();
    }
    // Valid token, set user
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken, optionalAuth };
