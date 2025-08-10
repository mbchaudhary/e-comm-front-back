const express = require('express');
const router = express.Router();
const cartItemController = require('../controllers/cartItemController');
const { optionalAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const withDatabaseMiddleware = require('../middleware/withDatabaseMiddleware');
const { cartItemSchema } = require('../utils/validators');

router.post('/', optionalAuth, validate(cartItemSchema), withDatabaseMiddleware(cartItemController.createCartItem));
router.get('/', optionalAuth, withDatabaseMiddleware(cartItemController.getCartItems));
router.get('/:id', optionalAuth, withDatabaseMiddleware(cartItemController.getCartItemById));
router.put('/:id', optionalAuth, validate(cartItemSchema), withDatabaseMiddleware(cartItemController.updateCartItem));
router.delete('/:id', optionalAuth, withDatabaseMiddleware(cartItemController.deleteCartItem));

module.exports = router;
