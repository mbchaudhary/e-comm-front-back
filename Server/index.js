const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorMiddleware');
const rateLimitMiddleware = require('./middleware/rateLimitMiddleware');

// Express will handle route validation internally

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const orderItemRoutes = require('./routes/orderItemRoutes');
const cartRoutes = require('./routes/cartRoutes');
const cartItemRoutes = require('./routes/cartItemRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static('uploads'));

// Configure API routes
const apiRouter = express.Router();

// Apply rate limiting to all API routes
apiRouter.use(rateLimitMiddleware);

// Mount routes in order (non-parameterized routes first)
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/order-items', orderItemRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/cart-items', cartItemRoutes);
apiRouter.use('/wishlist', wishlistRoutes);
apiRouter.use('/payments', paymentRoutes);

// Mount API router
app.use('/api', apiRouter);

// 404 handler
app.all('*', (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;
  console.error(message);
  res.status(404).json({ error: message });
});

// Error handler
app.use(errorHandler);

// Uncaught Exception Handler
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

// Unhandled Rejection Handler
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION:', err);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
