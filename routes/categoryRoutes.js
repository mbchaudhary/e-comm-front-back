const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { optionalAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const withDatabaseMiddleware = require('../middleware/withDatabaseMiddleware');
const { categorySchema } = require('../utils/validators');

router.get('/', optionalAuth, withDatabaseMiddleware(categoryController.getAllCategories));
router.get('/:id', optionalAuth, withDatabaseMiddleware(categoryController.getCategoryById));
// Admin protected routes
router.post('/', optionalAuth, validate(categorySchema), withDatabaseMiddleware(categoryController.createCategory));
router.put('/:id', optionalAuth, validate(categorySchema), withDatabaseMiddleware(categoryController.updateCategory));
router.delete('/:id', optionalAuth, withDatabaseMiddleware(categoryController.deleteCategory));

module.exports = router;
