const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { optionalAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const withDatabaseMiddleware = require('../middleware/withDatabaseMiddleware');
const { userSchema } = require('../utils/validators');

// Define routes with optional authentication
router.get('/', optionalAuth, withDatabaseMiddleware(userController.getUsers));
router.post('/', optionalAuth, validate(userSchema), withDatabaseMiddleware(userController.createUser));
router.get('/:userId', optionalAuth, withDatabaseMiddleware(userController.getUserProfile));
router.put('/:userId', optionalAuth, validate(userSchema), withDatabaseMiddleware(userController.updateUserProfile));
router.delete('/:userId', optionalAuth, withDatabaseMiddleware(userController.deleteUser));

module.exports = router;
