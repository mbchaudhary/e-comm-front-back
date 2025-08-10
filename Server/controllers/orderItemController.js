const logger = require("../config/logger");

exports.createOrderItem = async (req, res) => {
  const { order_id, product_id, quantity, price } = req.body;

  try {
    const { rows } = await req.db.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [order_id, product_id, quantity, price]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getOrderItems = async (req, res) => {
  try {
    const { rows } = await req.db.query('SELECT * FROM order_items');
    res.json(rows);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getOrderItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await req.db.query('SELECT * FROM order_items WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order item not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateOrderItem = async (req, res) => {
  const { id } = req.params;
  const { order_id, product_id, quantity, price } = req.body;

  try {
    const { rows } = await req.db.query(
      'UPDATE order_items SET order_id = $1, product_id = $2, quantity = $3, price = $4 WHERE id = $5 RETURNING *',
      [order_id, product_id, quantity, price, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order item not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteOrderItem = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await req.db.query('DELETE FROM order_items WHERE id = $1 RETURNING *', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order item not found' });
    }
    res.json({ message: 'Order item deleted successfully' });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
