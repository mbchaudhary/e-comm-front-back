const logger = require("../config/logger");
const Joi = require("joi");
const createOrderSchema = require("../utils/validators").createOrderSchema;

// Helper functions from your existing code
async function getCompleteOrderDetails(orderId, db) {
  const orderResult = await db.query(
    `SELECT o.*, u.full_name as customer_name
     FROM orders o
     JOIN users u ON o.user_id = u.id
     WHERE o.id = $1`,
    [orderId]
  );
  if (orderResult.rows.length === 0) return null;

  const order = orderResult.rows[0];
  order.items = await getOrderItems(orderId, db);
  return order;
}

async function getOrderItems(orderId, db) {
  const itemsResult = await db.query(
    `SELECT oi.*, p.name, p.brand, p.images
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = $1`,
    [orderId]
  );
  return itemsResult.rows;
}

// CREATE ORDER
exports.createOrder = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const userId = req.user.userId;

  // Validate input
  const { error, value } = createOrderSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const {
    order_total,
    payment_method,
    order_status,
    shipping_address,
    order_items,
  } = value;

  try {
    await req.db.query("BEGIN");

    // Validate products stock
    for (const item of order_items) {
      const { rows } = await req.db.query(
        "SELECT stock_quantity FROM products WHERE id = $1",
        [item.product_id]
      );
      if (rows.length === 0)
        throw new Error(`Product ${item.product_id} not found`);
      if (rows[0].stock_quantity < item.quantity)
        throw new Error(`Insufficient stock for product ${item.product_id}`);
    }

    const jsonShippingAddress = JSON.stringify(shipping_address);

    // Insert into orders
    const { rows: orderRows } = await req.db.query(
      `INSERT INTO orders (user_id, order_total, payment_method, order_status, shipping_address)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        userId,
        order_total,
        payment_method,
        order_status || "pending",
        jsonShippingAddress,
      ]
    );

    const orderId = orderRows[0].id;

    // Insert order items and update stock
    for (const item of order_items) {
      await req.db.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, item.price]
      );

      await req.db.query(
        `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    await req.db.query("COMMIT");

    const completeOrder = await getCompleteOrderDetails(orderId, req.db);
    res.status(201).json(completeOrder);
  } catch (err) {
    await req.db.query("ROLLBACK");
    logger.error(err.message);
    res.status(500).json({ error: err.message || "Failed to create order" });
  }
};

// GET ALL ORDERS (Admin only, paginated, optional status filter)
exports.getAllOrders = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Parse pagination and filter params
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    // Base query selecting orders + customer name + total count
    let query = `
      SELECT o.*, u.full_name as customer_name, 
             COUNT(*) OVER() as total_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
    `;

    const values = [];

    // Optional status filter
    if (status) {
      query += " WHERE o.order_status = $1";
      values.push(status);
    }

    // Add pagination
    query += ` ORDER BY o.ordered_at DESC LIMIT $${values.length + 1} OFFSET $${
      values.length + 2
    }`;
    values.push(limit, offset);

    // Execute query
    const { rows } = await req.db.query(query, values);

    const total = rows.length > 0 ? parseInt(rows[0].total_count) : 0;
    const totalPages = Math.ceil(total / limit);

    // Return results with pagination info
    res.json({
      orders: rows.map(({ total_count, ...order }) => order),
      pagination: {
        total,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// GET ORDER BY ID
exports.getOrderById = async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.userId;

  try {
    const completeOrder = await getCompleteOrderDetails(orderId, req.db);

    if (!completeOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (req.user.role !== "admin" && completeOrder.user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to view this order" });
    }

    res.json(completeOrder);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

// GET ORDERS BY USER (Paginated, optional status)
exports.getOrdersByUser = async (req, res) => {
  // Use the user ID from URL param
  const requestedUserId = parseInt(req.params.id, 10);
  if (isNaN(requestedUserId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  // req.user is from auth middleware (optionalAuth)
  if (!req.user) {
    // Not authenticated
    return res.status(401).json({ error: "Authentication required" });
  }

  // Authorization: user can fetch only their own orders unless admin
  if (req.user.role !== "admin" && req.user.userId !== requestedUserId) {
    return res
      .status(403)
      .json({ error: "Forbidden: cannot access other users' orders" });
  }

  const { page = 1, limit = 10, status } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT 
        o.id AS order_id,
        o.user_id,
        o.order_status,
        o.ordered_at,
        o.order_total,
        COUNT(*) OVER(PARTITION BY o.id) as total_count,

        oi.id AS item_id,
        oi.product_id,
        oi.quantity,
        oi.price,

        p.name AS product_name,
        p.description AS product_description,
        p.images AS product_images
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      WHERE o.user_id = $1
    `;

    const values = [requestedUserId];
    if (status) {
      query += ` AND o.order_status = $2`;
      values.push(status);
    }

    query += ` 
      ORDER BY o.ordered_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    values.push(limit, offset);

    const { rows } = await req.db.query(query, values);

    const total = rows.length > 0 ? parseInt(rows[0].total_count) : 0;
    const totalPages = Math.ceil(total / limit);

    // Group data back into order → items → product
    const ordersMap = {};
    rows.forEach((row) => {
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          id: row.order_id,
          user_id: row.user_id,
          order_status: row.order_status,
          ordered_at: row.ordered_at,
          order_total: row.order_total,
          items: [],
        };
      }

      ordersMap[row.order_id].items.push({
        id: row.item_id,
        product_id: row.product_id,
        quantity: row.quantity,
        price: row.price,
        product: {
          id: row.product_id,
          name: row.product_name,
          description: row.product_description,
          images: row.product_images,
        },
      });
    });

    res.json({
      orders: Object.values(ordersMap),
      pagination: {
        total,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// UPDATE ORDER (status update allowed only for admin)
exports.updateOrder = async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.userId;

  // Validate input
  const { error, value } = updateOrderSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    // Check order existence + ownership/admin
    const orderCheck = await req.db.query(
      "SELECT user_id FROM orders WHERE id = $1",
      [orderId]
    );
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (req.user.role !== "admin" && orderCheck.rows[0].user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this order" });
    }

    // Only admin can update order_status
    const updates = [];
    const values = [];
    let valueCount = 1;

    if (value.order_status) {
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ error: "Only admin can update order status" });
      }
      updates.push(`order_status = $${valueCount++}`);
      values.push(value.order_status);
    }

    if (value.shipping_address) {
      const jsonShippingAddress = JSON.stringify(value.shipping_address);

      updates.push(`shipping_address = $${valueCount++}`);
      values.push(jsonShippingAddress);
    }

    if (value.payment_method) {
      updates.push(`payment_method = $${valueCount++}`);
      values.push(value.payment_method);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    values.push(orderId);
    const query = `
      UPDATE orders
      SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${valueCount}
      RETURNING *
    `;

    await req.db.query(query, values);

    const updatedOrder = await getCompleteOrderDetails(orderId, req.db);
    res.json(updatedOrder);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Failed to update order" });
  }
};

// DELETE ORDER (only pending orders; restores stock)
exports.deleteOrder = async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.userId;

  try {
    await req.db.query("BEGIN");

    // Check existence and authorization
    const orderCheck = await req.db.query(
      "SELECT user_id, order_status FROM orders WHERE id = $1",
      [orderId]
    );
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (req.user.role !== "admin" && orderCheck.rows[0].user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this order" });
    }
    if (orderCheck.rows[0].order_status !== "pending") {
      return res
        .status(400)
        .json({ error: "Only pending orders can be deleted" });
    }

    // Restore stock quantities for each order item
    const orderItems = await req.db.query(
      "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
      [orderId]
    );
    for (const item of orderItems.rows) {
      await req.db.query(
        "UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2",
        [item.quantity, item.product_id]
      );
    }

    // Delete order items and order
    await req.db.query("DELETE FROM order_items WHERE order_id = $1", [
      orderId,
    ]);
    await req.db.query("DELETE FROM orders WHERE id = $1", [orderId]);

    await req.db.query("COMMIT");
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    await req.db.query("ROLLBACK");
    logger.error(err.message);
    res.status(500).json({ error: "Failed to delete order" });
  }
};
