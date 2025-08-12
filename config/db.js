const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.PG_USER || "postgres",
  host: process.env.PG_HOST || "localhost",
  database: process.env.PG_DATABASE || "e-comm",
  password: process.env.PG_PASSWORD || "1234",
  port: process.env.PG_PORT || 5432,
});

function convertNamedQueryToPositional(sqlStmt, params) {
  const values = [];
  const fields = [];
  let paramIndex = 1;
  const newQueryText = sqlStmt.replace(/\$\w+/g, (match) => {
    const paramName = match.substring(1); // Remove the colon
    fields.push(paramName);
    values.push(params[paramName]);
    const result = `$${paramIndex}`;
    paramIndex += 1;
    return result;
  });

  return { sqlStmt: newQueryText, params: values };
}

async function getConnection() {
  const client = await pool.connect();

  async function namedQueryAll(sqlStmt, params) {
    const newQuery = convertNamedQueryToPositional(sqlStmt, params);
    const res = await client.query(newQuery.sqlStmt, newQuery.params);
    return res.rows;
  }

  async function namedQueryOne(sqlStmt, params) {
    const res = await namedQueryAll(sqlStmt, params);
    return res[0];
  }

  async function queryAll(sqlStmt, params) {
    const res = await client.query(sqlStmt, params);
    return res.rows;
  }

  async function queryOne(sqlStmt, params) {
    const res = await queryAll(sqlStmt, params);
    return res[0];
  }

  const obj = {
    client,
    query: (sqlStmt, params) => client.query(sqlStmt, params),
    release: () => client.release(),
    namedQueryAll,
    namedQueryOne,
    queryAll,
    queryOne,
  };

  return obj;
}

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
  } else {
    console.log('Successfully connected to database');
    release();
  }
});

module.exports = {
  pool,
  getConnection,

  /**
   * @param {any[]} params
   * @returns {Parameter}
   */
  parameter: (...params) => new Parameter(params)
};
