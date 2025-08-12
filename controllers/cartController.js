const logger = require("../config/logger");

exports.createCart = async (req, res) => {
  const { user_id } = req.body;

  try {
    // Check if user already has a cart
    const existingCart = await req.db.query('SELECT * FROM cart WHERE user_id = $1', [user_id]);
    if (existingCart.rows.length > 0) {
      return res.status(400).json({ error: 'User already has a cart' });
    }

    const { rows } = await req.db.query(
      'INSERT INTO cart (user_id) VALUES ($1) RETURNING *',
      [user_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    logger.error('Create cart error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getCarts = async (req, res) => {
  try {
    const query = `
      SELECT c.*, u.full_name as user_name
      FROM cart c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `;
    const { rows } = await req.db.query(query);
    res.json(rows);
  } catch (err) {
    logger.error('Get carts error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getCartById = async (req, res) => {
  const { id } = req.params;
  try {
    const cartQuery = `
      SELECT c.*, u.full_name as user_name
      FROM cart c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `;
    const { rows } = await req.db.query(cartQuery, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Get cart items
    const itemsQuery = `
      SELECT ci.*, p.name, p.price, p.images, p.brand, p.stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
      ORDER BY ci.created_at DESC
    `;
    const itemsResult = await req.db.query(itemsQuery, [rows[0].id]);
    rows[0].items = itemsResult.rows;

    res.json(rows[0]);
  } catch (err) {
    logger.error('Get cart by id error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateCart = async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  try {
    const updateQuery = `
      UPDATE cart 
      SET user_id = COALESCE($1, user_id), updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;
    const { rows } = await req.db.query(updateQuery, [user_id, id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    logger.error('Update cart error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteCart = async (req, res) => {
  const { id } = req.params;
  try {
    // First delete all cart items
    await req.db.query('DELETE FROM cart_items WHERE cart_id = $1', [id]);
    
    // Then delete the cart
    const deleteQuery = 'DELETE FROM cart WHERE id = $1 RETURNING *';
    const { rows } = await req.db.query(deleteQuery, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    res.json({ message: 'Cart deleted successfully' });
  } catch (err) {
    logger.error('Delete cart error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
