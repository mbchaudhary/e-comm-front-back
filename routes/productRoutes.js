const express = require('express');
const router = express.Router({ strict: true, caseSensitive: true });
const productController = require('../controllers/productController');
const { optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validationMiddleware');
const withDatabaseMiddleware = require('../middleware/withDatabaseMiddleware');
const { productCreateSchema, productUpdateSchema } = require('../utils/validators');

router.get('/', optionalAuth, withDatabaseMiddleware(productController.getAllProducts));
router.get('/:id', optionalAuth, withDatabaseMiddleware(productController.getProductById));
router.post('/', optionalAuth, upload.single('image'), validate(productCreateSchema), withDatabaseMiddleware(productController.createProduct));
router.put('/:id', optionalAuth, upload.single('image'), validate(productUpdateSchema), withDatabaseMiddleware(productController.updateProduct));
router.delete('/:id', optionalAuth, withDatabaseMiddleware(productController.deleteProduct));

module.exports = router;
