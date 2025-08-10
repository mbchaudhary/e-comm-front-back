const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { optionalAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const withDatabaseMiddleware = require('../middleware/withDatabaseMiddleware');
const { wishlistSchema } = require('../utils/validators');

// Add to wishlist
router.post('/', optionalAuth, validate(wishlistSchema), withDatabaseMiddleware(wishlistController.createWishlist));

// Get all wishlists (admin)
router.get('/all', optionalAuth, withDatabaseMiddleware(wishlistController.getAllWishlists));

// Get user's wishlist
router.get('/', optionalAuth, withDatabaseMiddleware(wishlistController.getWishlistByUser));

// Get specific wishlist item
router.get('/:id', optionalAuth, withDatabaseMiddleware(wishlistController.getWishlistById));

// Update wishlist item
router.put('/:id', optionalAuth, validate(wishlistSchema), withDatabaseMiddleware(wishlistController.updateWishlist));

// Delete wishlist item
router.delete('/:id', optionalAuth, withDatabaseMiddleware(wishlistController.deleteWishlist));

module.exports = router;
