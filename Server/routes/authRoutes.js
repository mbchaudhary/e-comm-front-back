const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validationMiddleware');
const { optionalAuth } = require('../middleware/authMiddleware');
const withDatabaseMiddleware = require('../middleware/withDatabaseMiddleware');
const {
  signupSchema,
  loginSchema,
  updateUserSchema
} = require('../utils/validators');

router.post('/register', validate(signupSchema), withDatabaseMiddleware(authController.signup));
router.post('/login', validate(loginSchema), withDatabaseMiddleware(authController.login));
router.put('/user/:id', validate(updateUserSchema), withDatabaseMiddleware(authController.updateUser));
router.delete('/user/:id', optionalAuth, withDatabaseMiddleware(authController.deleteUser));

module.exports = router;
