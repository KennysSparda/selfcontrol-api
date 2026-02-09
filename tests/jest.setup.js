// tests/jest.setup.js
const dotenv = require("dotenv");
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env.test" });

const { pool } = require("../src/db");
const { initDatabase } = require("../src/models/databaseModel");

async function limparBanco() {
  await pool.query(`
    TRUNCATE TABLE
      produtoestoque,
      movimentacoes,
      funcionario,
      estoque,
      produto
    RESTART IDENTITY CASCADE
  `);
}

beforeAll(async () => {
  await initDatabase({ silent: true });
});

beforeEach(async () => {
  await limparBanco();
});

afterAll(async () => {
  await pool.end();
});
