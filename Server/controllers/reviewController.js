const logger = require("../config/logger");

exports.addReview = async (req, res) => {
  const { product_id, user_id, rating, comment } = req.body;

  try {
    // Check if product exists
    const { rows } = await req.db.query(
      "SELECT id FROM products WHERE id = $1",
      [product_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if user already reviewed this product
    const { rows: existingReview } = await req.db.query(
      "SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2",
      [product_id, user_id]
    );
    if (existingReview.length > 0) {
      return res.status(400).json({ error: "User has already reviewed this product" });
    }

    // Add review
    const { rows: newReview } = await req.db.query(
      "INSERT INTO reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
      [product_id, user_id, rating, comment]
    );

    res.status(201).json(newReview[0]);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const { rows } = await req.db.query(
      'SELECT r.*, u.full_name, p.name as product_name FROM reviews r ' +
      'LEFT JOIN users u ON r.user_id = u.id ' +
      'LEFT JOIN products p ON r.product_id = p.id ' +
      'ORDER BY r.created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

exports.getReviewById = async (req, res) => {
  const reviewId = req.params.id;
  try {
    const { rows } = await req.db.query(
      'SELECT r.*, u.full_name, p.name as product_name FROM reviews r ' +
      'LEFT JOIN users u ON r.user_id = u.id ' +
      'LEFT JOIN products p ON r.product_id = p.id ' +
      'WHERE r.id = $1',
      [reviewId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
};

exports.getReviewsByProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const { rows } = await req.db.query(
      `SELECT r.*, u.full_name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [productId]
    );
    res.json(rows);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getReviewsByUser = async (req, res) => {
  const userId = req.params.userId || (req.user ? req.user.userId : null);
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }
  
  try {
    const { rows } = await req.db.query(
      'SELECT r.*, p.name as product_name FROM reviews r ' +
      'LEFT JOIN products p ON r.product_id = p.id ' +
      'WHERE r.user_id = $1 ORDER BY r.created_at DESC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: 'Failed to fetch user reviews' });
  }
};

exports.updateReview = async (req, res) => {
  const reviewId = req.params.id;
  const userId = req.user ? req.user.userId : null;
  const { rating, comment } = req.body;

  try {
    // Check if review exists
    const checkResult = await req.db.query('SELECT * FROM reviews WHERE id = $1', [reviewId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const review = checkResult.rows[0];
    
    // If user is authenticated, check authorization
    if (req.user) {
      if (req.user.role !== 'admin' && review.user_id !== userId) {
        return res.status(403).json({ error: 'Not authorized to update this review' });
      }
    } else {
      // For anonymous users, allow updates if they provide the original user_name
      const { user_name } = req.body;
      if (!user_name || review.user_name !== user_name) {
        return res.status(403).json({ error: 'Not authorized to update this review' });
      }
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const updateFields = [];
    const values = [];
    let valueCount = 1;

    if (rating !== undefined) {
      updateFields.push(`rating = $${valueCount}`);
      values.push(rating);
      valueCount++;
    }

    if (comment !== undefined) {
      updateFields.push(`comment = $${valueCount}`);
      values.push(comment);
      valueCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(reviewId);
    const query = `
      UPDATE reviews 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${valueCount} 
      RETURNING *
    `;

    const { rows } = await req.db.query(query, values);
    res.json(rows[0]);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: 'Failed to update review' });
  }
};

exports.deleteReview = async (req, res) => {
  const { id } = req.params;

  try {
    const checkResult = await req.db.query('SELECT * FROM reviews WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    await req.db.query('DELETE FROM reviews WHERE id = $1', [id]);
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
