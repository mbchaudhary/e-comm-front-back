const Joi = require("joi");

// Auth schemas
const signupSchema = Joi.object({
  full_name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("user", "admin").default("user"),
  address: Joi.string().optional(),
  phone_number: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateUserSchema = Joi.object({
  full_name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid("user", "admin").default("user"),
  address: Joi.string().optional(),
  phone_number: Joi.string().optional(),
});

// User schema for updates
const userSchema = Joi.object({
  full_name: Joi.string().min(3).max(100).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid("user", "admin").optional(),
  address: Joi.string().optional(),
  phone_number: Joi.string().optional(),
});

// Category
const categorySchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().optional(),
});

// Product
const productCreateSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  brand: Joi.string().min(1).max(50).required(),
  description: Joi.string().allow("").optional(), // optional string, can be empty
  price: Joi.number().positive().required(),
  discount: Joi.number().min(0).max(100).optional(), // assuming discount is percentage or amount
  specifications: Joi.object({
    storage: Joi.string().optional(),
    controller_type: Joi.string().optional(),
  }).optional(),
  category_id: Joi.number().integer().required(),
  images: Joi.array().items(Joi.string()).optional(),
  stock_quantity: Joi.number().integer().min(0).required(),
  ratings: Joi.number().min(0).max(5).optional(),
  reviews_count: Joi.number().integer().min(0).optional(),
  created_at: Joi.date().iso().optional(),
  updated_at: Joi.date().iso().optional(),
});

const productUpdateSchema = productCreateSchema.fork(
  ["name", "description", "price", "stock_quantity", "category_id"],
  (schema) => schema.optional()
);

// Order Item

const orderItemSchema = Joi.object({
  product_id: Joi.number().integer().required(),
  quantity: Joi.number().integer().min(1).required(),
  price: Joi.number().positive().required(),
});

// Order

const createOrderSchema = Joi.object({
  order_total: Joi.number().positive().required(),
  payment_method: Joi.string().required(),
  order_status: Joi.string()
    .valid("pending", "completed", "cancelled")
    .default("pending"),
  shipping_address: Joi.string().required(),
  order_items: Joi.array().items(orderItemSchema).min(1).required(),
});

const updateOrderSchema = Joi.object({
  order_status: Joi.string()
    .valid("pending", "completed", "cancelled")
    .optional(),
  shipping_address: Joi.string().optional(),
  payment_method: Joi.string().optional(),
}).min(1);


// Review
const reviewSchema = Joi.object({
  product_id: Joi.number().integer().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().optional(),
});

// Cart
const cartSchema = Joi.object({
  user_id: Joi.number().integer().optional(),
});

// Cart Item
const cartItemSchema = Joi.object({
  product_id: Joi.number().integer().required(),
  quantity: Joi.number().integer().min(1).required(),
});

// Wishlist
const wishlistSchema = Joi.object({
  product_id: Joi.number().integer().required(),
});

// Payment
const paymentSchema = Joi.object({
  order_id: Joi.number().integer().required(),
  payment_method: Joi.number().positive().required(),
  payment_status: Joi.string().required(),
  transaction_id: Joi.string().required(),
  amount: Joi.number().positive().required(),
  payment_date: Joi.date().iso().required(),
});

module.exports = {
  signupSchema,
  loginSchema,
  updateUserSchema,
  userSchema,
  categorySchema,
  productCreateSchema,
  productUpdateSchema,
  //   orderSchema,
  createOrderSchema,
  updateOrderSchema,
  orderItemSchema,
  reviewSchema,
  cartSchema,
  cartItemSchema,
  wishlistSchema,
  paymentSchema,
};
