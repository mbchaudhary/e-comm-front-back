const logger = require('../config/logger');

exports.getAllCategories = async (req, res) => {
  try {
    const { rows } = await req.db.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await req.db.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createCategory = async (req, res) => {
  const { name, description, parent_category_id } = req.body;
  try {
    const { rows } = await req.db.query(
      'INSERT INTO categories (name, description, parent_category_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description || null, parent_category_id || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description, parent_category_id } = req.body;
  try {
    const { rows } = await req.db.query(
      'UPDATE categories SET name = COALESCE($1, name), description = COALESCE($2, description), parent_category_id = COALESCE($3, parent_category_id), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, description, parent_category_id, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await req.db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
