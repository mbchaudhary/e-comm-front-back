# JWT Token System Guide

## Overview

This e-commerce application uses JWT (JSON Web Tokens) for authentication. The system is designed to be flexible - users can access all routes with or without authentication tokens.

## How It Works

### 1. User Registration
When a user registers, a JWT token is automatically generated and returned.

```bash
POST /api/auth/register
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "user",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. User Login
When a user logs in, a JWT token is generated and returned.

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "user",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Using JWT Tokens

### With Token (Authenticated Access)
Include the token in the Authorization header:

```bash
# Get user profile
GET /api/users/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Create product (admin only)
POST /api/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Product Name",
  "price": 99.99,
  "description": "Product description",
  "category_id": 1,
  "stock_quantity": 10
}

# Add to cart
POST /api/cart
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "user_id": 1
}
```

### Without Token (Public Access)
All routes work without authentication:

```bash
# Get all products
GET /api/products

# Get user profile (limited info)
GET /api/users/1

# Get categories
GET /api/categories

# Get product reviews
GET /api/reviews/product/1
```

## Token Features

### Token Structure
The JWT token contains:
- `userId`: User's unique ID
- `role`: User's role (user/admin)
- `exp`: Expiration time (24 hours)

### Token Expiration
- Tokens expire after 24 hours
- Users need to login again after expiration
- No automatic refresh implemented

### Security Features
- Tokens are signed with JWT_SECRET
- Invalid tokens are ignored (not rejected)
- Passwords are hashed with bcrypt
- Role-based access control for admin features

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `PUT /api/auth/user/:id` - Update user
- `DELETE /api/auth/user/:id` - Delete user

### Product Routes
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### User Routes
- `GET /api/users` - Get all users
- `GET /api/users/:userId` - Get user profile
- `POST /api/users` - Create user
- `PUT /api/users/:userId` - Update user profile
- `DELETE /api/users/:userId` - Delete user

### Category Routes
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Review Routes
- `GET /api/reviews/product/:productId` - Get reviews by product
- `POST /api/reviews` - Add review
- `DELETE /api/reviews/:id` - Delete review

### Cart Routes
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Create cart
- `PUT /api/cart/:id` - Update cart
- `DELETE /api/cart/:id` - Delete cart

### Order Routes
- `GET /api/orders` - Get all orders
- `GET /api/orders/user` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

## Error Handling

### Common Error Responses

**Invalid Credentials:**
```json
{
  "error": "Invalid credentials"
}
```

**Token Missing:**
```json
{
  "error": "Access denied, token missing"
}
```

**Invalid Token:**
```json
{
  "error": "Invalid or expired token"
}
```

**Admin Only:**
```json
{
  "error": "Admin only"
}
```

## Testing

Run the test script to verify the JWT system:

```bash
cd Server
npm install axios
node test-login.js
```

## Environment Variables

Make sure to set the JWT secret in your `.env` file:

```env
JWT_SECRET=your-super-secret-jwt-key-here
```

## Best Practices

1. **Store tokens securely** - Use localStorage, sessionStorage, or secure cookies
2. **Handle token expiration** - Implement automatic logout when tokens expire
3. **Validate tokens** - Always verify tokens on the server side
4. **Use HTTPS** - Always use HTTPS in production
5. **Rotate secrets** - Regularly rotate your JWT_SECRET
6. **Monitor usage** - Log authentication attempts and failures

## Security Considerations

- JWT tokens are stateless and cannot be revoked
- Implement token blacklisting for logout if needed
- Consider implementing refresh tokens for better security
- Always validate user permissions on the server side
- Use rate limiting to prevent brute force attacks
