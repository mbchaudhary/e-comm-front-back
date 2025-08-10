const bcrypt = require("bcrypt");
const logger = require("../config/logger");

exports.createUser = async (req, res) => {
  const { full_name, email, password, role, address, phone_number } = req.body;

  try {
    // Check if email already exists
    const emailCheck = await req.db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const jsonAddress = address ? JSON.stringify(address) : null;
    const jsonPhoneNumber = phone_number ? JSON.stringify(phone_number) : null;

    const { rows } = await req.db.query(
      `INSERT INTO users (full_name, email, password_hash, role, address, phone_number)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, full_name, role, address, phone_number, created_at`,
      [
        full_name,
        email,
        hashedPassword,
        role || 'user',
        jsonAddress,
        jsonPhoneNumber,
      ]
    );

    res.status(201).json({
      message: "User created successfully",
      user: rows[0],
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, full_name, email, role, address, phone_number, created_at, updated_at
      FROM users
    `;
    const values = [];

    if (search) {
      query += ` WHERE full_name ILIKE $1 OR email ILIKE $1`;
      values.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${
      values.length + 2
    }`;
    values.push(limit, offset);

    const { rows } = await req.db.query(query, values);

    res.json(rows);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUserProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const { rows } = await req.db.query(
      `SELECT id, full_name, email, role, address, phone_number, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const { full_name, email, password, role, address, phone_number } = req.body;

  try {
    // Check if user exists
    const { rows } = await req.db.query(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const jsonAddress = address ? JSON.stringify(address) : null;
    const jsonPhoneNumber = phone_number ? JSON.stringify(phone_number) : null;

    const query = `
      UPDATE users
      SET full_name = COALESCE($1, full_name),
          email = COALESCE($2, email),
          role = COALESCE($3, role),
          password_hash = COALESCE($4, password_hash),
          address = COALESCE($5, address),
          phone_number = COALESCE($6, phone_number),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING id, full_name, email, role, address, phone_number, created_at, updated_at
    `;

    const values = [
      full_name,
      email,
      role,
      hashedPassword,
      jsonAddress,
      jsonPhoneNumber,
      userId,
    ];

    const { rows: updatedRows } = await req.db.query(query, values);

    res.json({
      message: "User updated successfully",
      user: updatedRows[0],
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const { rows } = await req.db.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
