// src/db.js
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL não definido (verifique dotenv e .env/.env.test)",
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

module.exports = { pool };
