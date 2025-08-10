const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const { optionalAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const withDatabaseMiddleware = require('../middleware/withDatabaseMiddleware');
const { reviewSchema } = require('../utils/validators');

router.post('/', optionalAuth, validate(reviewSchema), withDatabaseMiddleware(reviewController.addReview));
router.get('/product/:productId', optionalAuth, withDatabaseMiddleware(reviewController.getReviewsByProduct));
router.delete('/:id', optionalAuth, withDatabaseMiddleware(reviewController.deleteReview));

module.exports = router;
