const express = require('express');
const router = express.Router({ mergeParams: true });
const orderController = require('../controllers/orderController');
const { optionalAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const withDatabaseMiddleware = require('../middleware/withDatabaseMiddleware');
const { createOrderSchema } = require('../utils/validators');
const {updateOrderSchema} = require('../utils/validators');

// Create new order
router.post('/', optionalAuth, validate(createOrderSchema), withDatabaseMiddleware(orderController.createOrder));

// Get all orders (admin only)
router.get('/', optionalAuth, withDatabaseMiddleware(orderController.getAllOrders));

// Important: More specific routes should come before parameter routes
// Get orders for current user
router.get('/user/:id', optionalAuth, withDatabaseMiddleware(orderController.getOrdersByUser));

// Get specific order
router.get('/:id', optionalAuth, withDatabaseMiddleware(orderController.getOrderById));

// Update order
router.put('/:id', optionalAuth, validate(updateOrderSchema), withDatabaseMiddleware(orderController.updateOrder));

// Delete order
router.delete('/:id', optionalAuth, withDatabaseMiddleware(orderController.deleteOrder));

module.exports = router;
