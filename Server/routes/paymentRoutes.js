const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { optionalAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const withDatabaseMiddleware = require('../middleware/withDatabaseMiddleware');
const { paymentSchema } = require('../utils/validators');

router.post('/', optionalAuth, validate(paymentSchema), withDatabaseMiddleware(paymentController.createPayment));
router.get('/', optionalAuth, withDatabaseMiddleware(paymentController.getPayments));
router.get('/:id', optionalAuth, withDatabaseMiddleware(paymentController.getPaymentById));
router.put('/:id', optionalAuth, validate(paymentSchema), withDatabaseMiddleware(paymentController.updatePayment));
router.delete('/:id', optionalAuth, withDatabaseMiddleware(paymentController.deletePayment));

module.exports = router;
