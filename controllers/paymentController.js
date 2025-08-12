const logger = require("../config/logger");

exports.createPayment = async (req, res) => {
  const { order_id, payment_method, amount, status } = req.body;

  try {
    const { rows } = await req.db.query(
      'INSERT INTO payment_details (order_id, payment_method, amount, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [order_id, payment_method, amount, status]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const { rows } = await req.db.query("SELECT * FROM payment_details");
    res.json(rows);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPaymentById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await req.db.query(
      'SELECT * FROM payment_details WHERE id = $1',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updatePayment = async (req, res) => {
  const { id } = req.params;
  const { order_id, payment_method, amount, status } = req.body;

  try {
    const { rows } = await req.db.query(
      'UPDATE payment_details SET order_id = $1, payment_method = $2, amount = $3, status = $4 WHERE id = $5 RETURNING *',
      [order_id, payment_method, amount, status, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deletePayment = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await req.db.query(
      'DELETE FROM payment_details WHERE id = $1 RETURNING *',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
