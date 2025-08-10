const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../config/logger");
require("dotenv").config();

exports.signup = async (req, res) => {
  const { full_name, email, password, role, address, phone_number } = req.body;
  try {
    const userCheck = await req.db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const jsonAddress = address ? JSON.stringify(address) : null;
    const jsonPhoneNumber = phone_number ? JSON.stringify(phone_number) : null;

    const result = await req.db.query(
      `INSERT INTO users (full_name, email, password_hash, role, address, phone_number)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, full_name, role, address, phone_number, created_at`,
      [
        full_name,
        email,
        hashedPassword,
        role || 'user',
        jsonAddress || null,
        jsonPhoneNumber || null,
      ]
    );

    const token = jwt.sign(
      { userId: result.rows[0].id, role: result.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
      token,
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await req.db.query(
      "SELECT id, email, full_name, role, password_hash, address, phone_number, created_at FROM users WHERE email = $1",
      [email]
    );
    const user = rows[0];
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword)
      return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({ 
      message: "Login successful", 
      user: userWithoutPassword, 
      token 
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const { full_name, email, password, role, address, phone_number } = req.body;

  try {
    const { rows } = await req.db.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const query = `
      UPDATE users
      SET full_name = COALESCE($1, full_name),
          email = COALESCE($2, email),
          role = COALESCE($3, role),
          password_hash = COALESCE($4, password),
          address = COALESCE($5, address),
          phone_number = COALESCE($6, phone_number),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING id, full_name, email, role, address, phone_number, created_at, updated_at;
    `;

    const values = [
      full_name,
      email,
      role,
      hashedPassword,
      address,
      phone_number,
      userId,
    ];

    const result = await req.db.query(query, values);

    res.status(200).json({
      message: "User updated successfully",
      user: result.rows[0],
    });
  } catch (err) {
    logger.error("Error updating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const { rows } = await req.db.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const result = await req.db.query("DELETE FROM users WHERE id = $1", [
      userId,
    ]);
    if (result.rowCount > 0) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    logger.error("Error executing query", err.stack);
    res.status(500).json({ error: "Error deleting user" });
  }
};
