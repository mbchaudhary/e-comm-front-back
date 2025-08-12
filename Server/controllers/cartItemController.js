const logger = require("../config/logger");

exports.createCartItem = async (req, res) => {
  const { cart_id, product_id, quantity } = req.body;

  try {
    let cartId = cart_id;

    // If no cart_id provided, find or create cart for the logged-in user
    if (!cartId) {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated and no cart_id provided' });
      }

      const userId = req.user.userId;

      // Check if user already has a cart
      const existingCart = await req.db.query(
        'SELECT id FROM cart WHERE user_id = $1',
        [userId]
      );

      if (existingCart.rows.length > 0) {
        cartId = existingCart.rows[0].id;
      } else {
        // Create new cart for user
        const newCart = await req.db.query(
          'INSERT INTO cart (user_id) VALUES ($1) RETURNING id',
          [userId]
        );
        cartId = newCart.rows[0].id;
      }
    } else {
      // If cart_id is provided, verify it exists
      const cartResult = await req.db.query(
        'SELECT * FROM cart WHERE id = $1',
        [cart_id]
      );
      if (cartResult.rows.length === 0) {
        return res.status(404).json({ error: 'Cart not found' });
      }
    }

    // Check if product exists and has sufficient stock
    const productResult = await req.db.query(
      'SELECT * FROM products WHERE id = $1',
      [product_id]
    );
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResult.rows[0];
    if (product.stock_quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock available' });
    }

    // Check if item already exists in cart
    const existingItem = await req.db.query(
      'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, product_id]
    );

    let result;
    if (existingItem.rows.length > 0) {
      const newQuantity = existingItem.rows[0].quantity + quantity;
      
      // Check if new quantity exceeds stock
      if (newQuantity > product.stock_quantity) {
        return res.status(400).json({ 
          error: `Cannot add ${quantity} items. Only ${product.stock_quantity - existingItem.rows[0].quantity} more available.` 
        });
      }

      // Update existing item quantity
      result = await req.db.query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE cart_id = $2 AND product_id = $3 RETURNING *',
        [newQuantity, cartId, product_id]
      );
    } else {
      // Create new cart item
      result = await req.db.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [cartId, product_id, quantity]
      );
    }

    // Get cart item with product details
    const item = await req.db.query(
      `SELECT ci.*, p.name, p.price, p.images, p.stock_quantity, p.brand
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(item.rows[0]);
  } catch (err) {
    logger.error('Create cart item error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get cart items for authenticated user
exports.getCartItems = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user.userId;

    // Get user's cart
    const cartResult = await req.db.query(
      'SELECT id FROM cart WHERE user_id = $1',
      [userId]
    );

    if (cartResult.rows.length === 0) {
      return res.json([]); // Return empty array if no cart exists
    }

    const cartId = cartResult.rows[0].id;

    // Get cart items with product details
    const { rows } = await req.db.query(
      `SELECT ci.*, p.name, p.price, p.images, p.stock_quantity, p.brand
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1
       ORDER BY ci.created_at DESC`,
      [cartId]
    );

    res.json(rows);
  } catch (err) {
    logger.error('Get cart items error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all cart items (admin function)
exports.getAllCartItems = async (req, res) => {
  try {
    const { rows } = await req.db.query(
      `SELECT ci.*, p.name, p.price, p.images, p.stock_quantity, c.user_id
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id
       JOIN cart c ON ci.cart_id = c.id
       ORDER BY ci.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    logger.error('Get all cart items error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getCartItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await req.db.query(
      `SELECT ci.*, p.name, p.price, p.images, p.stock_quantity, p.brand
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.id = $1`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Optional: Check if user owns this cart item
    if (req.user) {
      const cartOwnerCheck = await req.db.query(
        `SELECT c.user_id FROM cart c 
         JOIN cart_items ci ON c.id = ci.cart_id 
         WHERE ci.id = $1`,
        [id]
      );
      
      if (cartOwnerCheck.rows.length > 0 && cartOwnerCheck.rows[0].user_id !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json(rows[0]);
  } catch (err) {
    logger.error('Get cart item by id error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateCartItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    // Check if cart item exists and get product info
    const itemCheck = await req.db.query(
      `SELECT ci.*, p.stock_quantity, c.user_id
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       JOIN cart c ON ci.cart_id = c.id
       WHERE ci.id = $1`,
      [id]
    );
    
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const cartItem = itemCheck.rows[0];

    // Check if user owns this cart item
    if (req.user && cartItem.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check stock availability
    if (quantity > cartItem.stock_quantity) {
      return res.status(400).json({ 
        error: `Only ${cartItem.stock_quantity} items available in stock` 
      });
    }

    // Update quantity
    await req.db.query(
      'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [quantity, id]
    );

    // Get updated item with product details
    const updatedItem = await req.db.query(
      `SELECT ci.*, p.name, p.price, p.images, p.stock_quantity, p.brand
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.id = $1`,
      [id]
    );

    res.json(updatedItem.rows[0]);
  } catch (err) {
    logger.error('Update cart item error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteCartItem = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if cart item exists and user ownership
    const itemCheck = await req.db.query(
      `SELECT ci.*, c.user_id
       FROM cart_items ci
       JOIN cart c ON ci.cart_id = c.id
       WHERE ci.id = $1`,
      [id]
    );
    
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Check if user owns this cart item
    if (req.user && itemCheck.rows[0].user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await req.db.query('DELETE FROM cart_items WHERE id = $1', [id]);
    res.json({ message: 'Cart item deleted successfully' });
  } catch (err) {
    logger.error('Delete cart item error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Clear all cart items for a user
exports.clearCart = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user.userId;

    // Get user's cart
    const cartResult = await req.db.query(
      'SELECT id FROM cart WHERE user_id = $1',
      [userId]
    );

    if (cartResult.rows.length === 0) {
      return res.json({ message: 'Cart is already empty' });
    }

    const cartId = cartResult.rows[0].id;

    // Delete all cart items
    await req.db.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    
    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    logger.error('Clear cart error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
