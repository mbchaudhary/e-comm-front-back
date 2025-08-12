const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { optionalAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const withDatabaseMiddleware = require('../middleware/withDatabaseMiddleware');
const { cartSchema } = require('../utils/validators');

router.post('/', optionalAuth, validate(cartSchema), withDatabaseMiddleware(cartController.createCart));
router.get('/', optionalAuth, withDatabaseMiddleware(cartController.getCarts));
router.get('/:id', optionalAuth, withDatabaseMiddleware(cartController.getCartById));
router.put('/:id', optionalAuth, validate(cartSchema), withDatabaseMiddleware(cartController.updateCart));
router.delete('/:id', optionalAuth, withDatabaseMiddleware(cartController.deleteCart));

module.exports = router;
