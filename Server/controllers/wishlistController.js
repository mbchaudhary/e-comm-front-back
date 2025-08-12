const logger = require("../config/logger");

// controllers/wishlistController.js

exports.createWishlist = async (req, res) => {
  try {
    const { user_id, product_id } = req.body;

    if (!user_id || !product_id) {
      return res
        .status(400)
        .json({ error: "user_id and product_id are required" });
    }

    const userCheck = await req.db.query("SELECT id FROM users WHERE id = $1", [
      user_id,
    ]);
    if (userCheck.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const productCheck = await req.db.query(
      "SELECT id FROM products WHERE id = $1",
      [product_id]
    );
    if (productCheck.rows.length === 0)
      return res.status(404).json({ error: "Product not found" });

    const existingItem = await req.db.query(
      "SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2",
      [user_id, product_id]
    );
    if (existingItem.rows.length > 0) {
      return res.status(409).json({ error: "Item already in wishlist" });
    }

    const insertRes = await req.db.query(
      "INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) RETURNING id",
      [user_id, product_id]
    );

    const { rows } = await req.db.query(
      `SELECT w.id, w.user_id, w.product_id, p.name, p.price, p.images, p.description
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.id = $1`,
      [insertRes.rows[0].id]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Wishlist insert failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllWishlists = async (req, res) => {
  try {
    const { rows } = await req.db.query(
      `SELECT w.*, u.full_name as user_name, p.name as product_name, p.price, p.images 
       FROM wishlist w 
       JOIN users u ON w.user_id = u.id 
       JOIN products p ON w.product_id = p.id`
    );
    res.json(rows);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getWishlistByUser = async (req, res) => {
  // Get from params instead of query
  const { id } = req.params;

  const userId = parseInt(id, 10);
  if (!userId) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  try {
    const { rows } = await req.db.query(
      `SELECT w.*, p.name, p.price, p.images, p.description
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = $1`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getWishlistById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await req.db.query(
      `SELECT w.*, p.name, p.price, p.images 
       FROM wishlist w 
       JOIN products p ON w.product_id = p.id 
       WHERE w.id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Wishlist item not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateWishlist = async (req, res) => {
  const { id } = req.params;
  const { user_id, product_id } = req.body;

  try {
    // Check if wishlist item exists
    const existingItem = await req.db.query(
      "SELECT * FROM wishlist WHERE id = $1",
      [id]
    );
    if (existingItem.rows.length === 0) {
      return res.status(404).json({ error: "Wishlist item not found" });
    }

    // Check if product exists
    const productCheck = await req.db.query(
      "SELECT id FROM products WHERE id = $1",
      [product_id]
    );
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { rows } = await req.db.query(
      "UPDATE wishlist SET user_id = $1, product_id = $2 WHERE id = $3 RETURNING *",
      [user_id, product_id, id]
    );

    const updatedItem = await req.db.query(
      `SELECT w.*, p.name, p.price, p.images 
       FROM wishlist w 
       JOIN products p ON w.product_id = p.id 
       WHERE w.id = $1`,
      [id]
    );

    res.json(updatedItem.rows[0]);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteWishlist = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await req.db.query(
      "DELETE FROM wishlist WHERE id = $1 RETURNING *",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Wishlist item not found" });
    }
    res.json({ message: "Wishlist item deleted successfully" });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
