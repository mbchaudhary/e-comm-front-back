const logger = require("../config/logger");
const fs = require("fs");
const path = require("path");

// Helper to delete a file if needed
const deleteFile = (filepath) => {
  fs.unlink(filepath, (err) => {
    if (err) {
      logger.error(`Failed to delete file: ${filepath} - ${err.message}`);
    }
  });
};

exports.getAllProducts = async (req, res) => {
  try {
    const { rows } = await req.db.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await req.db.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    category_id,
    stock_quantity,
    image_url,
    specifications,
  } = req.body;

  try {
    const query = `
      INSERT INTO products (name, description, price, category_id, stock_quantity, image_url, specifications)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      name,
      description,
      price,
      category_id,
      stock_quantity,
      image_url,
      specifications,
    ];

    const { rows } = await req.db.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    price,
    category_id,
    stock_quantity,
    image_url,
    specifications,
  } = req.body;

  try {
    const { rows } = await req.db.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const updateQuery = `
      UPDATE products
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          category_id = COALESCE($4, category_id),
          stock_quantity = COALESCE($5, stock_quantity),
          image_url = COALESCE($6, image_url),
          specifications = COALESCE($7, specifications),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;

    const { rows: updatedRows } = await req.db.query(updateQuery, [
      name,
      description,
      price,
      category_id,
      stock_quantity,
      image_url,
      specifications,
      id,
    ]);

    res.json(updatedRows[0]);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await req.db.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    await req.db.query("DELETE FROM products WHERE id = $1", [id]);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
