const express = require('express');
const router = express.Router();
const orderItemController = require('../controllers/orderItemController');
const { optionalAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const withDatabaseMiddleware = require('../middleware/withDatabaseMiddleware');
const { orderItemSchema } = require('../utils/validators');

router.post('/', optionalAuth, validate(orderItemSchema), withDatabaseMiddleware(orderItemController.createOrderItem));
router.get('/', optionalAuth, withDatabaseMiddleware(orderItemController.getOrderItems));
router.get('/:id', optionalAuth, withDatabaseMiddleware(orderItemController.getOrderItemById));
router.put('/:id', optionalAuth, validate(orderItemSchema), withDatabaseMiddleware(orderItemController.updateOrderItem));
router.delete('/:id', optionalAuth, withDatabaseMiddleware(orderItemController.deleteOrderItem));

module.exports = router;
