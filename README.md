# API Documentation

## Authentication Endpoints

### Register User
- **POST** `/api/auth/register`
- Register a new user
- Body: `{ name: string, email: string, password: string }`

### Login
- **POST** `/api/auth/login`
- Login with existing credentials
- Body: `{ email: string, password: string }`

## User Endpoints

### Get User Profile
- **GET** `/api/users/:id`
- Get user profile details
- Requires Authentication

### Update User Profile
- **PUT** `/api/users/:id`
- Update user profile
- Requires Authentication
- Body: `{ name?: string, email?: string }`

## Product Endpoints

### Get All Products
- **GET** `/api/products`
- Get list of all products
- Query Parameters: 
  - page: number
  - limit: number
  - category: string
  - search: string

### Get Product by ID
- **GET** `/api/products/:id`
- Get single product details

### Create Product
- **POST** `/api/products`
- Create new product
- Requires Authentication (Admin)
- Body: `{ name: string, description: string, price: number, stock: number, categoryIds: string[] }`

### Update Product
- **PUT** `/api/products/:id`
- Update product details
- Requires Authentication (Admin)

### Delete Product
- **DELETE** `/api/products/:id`
- Delete product
- Requires Authentication (Admin)

## Cart Endpoints

### Get Cart
- **GET** `/api/cart`
- Get user's cart
- Requires Authentication

### Add to Cart
- **POST** `/api/cart-items`
- Add product to cart
- Requires Authentication
- Body: `{ productId: string, quantity: number }`

### Update Cart Item
- **PUT** `/api/cart-items/:id`
- Update cart item quantity
- Requires Authentication
- Body: `{ quantity: number }`

### Remove from Cart
- **DELETE** `/api/cart-items/:id`
- Remove item from cart
- Requires Authentication

## Order Endpoints

### Create Order
- **POST** `/api/orders`
- Create new order
- Requires Authentication
- Body: `{ addressId: string, paymentMethodId: string }`

### Get User Orders
- **GET** `/api/orders/user`
- Get user's order history
- Requires Authentication

### Get Order Details
- **GET** `/api/orders/:id`
- Get single order details
- Requires Authentication

### Update Order Status
- **PUT** `/api/orders/:id/status`
- Update order status
- Requires Authentication (Admin)
- Body: `{ status: string }`

## Category Endpoints

### Get All Categories
- **GET** `/api/categories`
- Get list of all categories

### Create Category
- **POST** `/api/categories`
- Create new category
- Requires Authentication (Admin)
- Body: `{ name: string, description?: string }`

## Review Endpoints

### Add Review
- **POST** `/api/reviews`
- Add product review
- Requires Authentication
- Body: `{ productId: string, rating: number, comment: string }`

### Get Product Reviews
- **GET** `/api/reviews/product/:productId`
- Get all reviews for a product

## Wishlist Endpoints

### Get Wishlist
- **GET** `/api/wishlist`
- Get user's wishlist
- Requires Authentication

### Add to Wishlist
- **POST** `/api/wishlist`
- Add product to wishlist
- Requires Authentication
- Body: `{ productId: string }`

### Remove from Wishlist
- **DELETE** `/api/wishlist/:id`
- Remove product from wishlist
- Requires Authentication
