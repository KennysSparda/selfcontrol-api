// tests/jest.setup.js
const dotenv = require("dotenv");
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env.test" });

const { pool } = require("../src/db");
const { initDatabase } = require("../src/models/databaseModel");
const { ensureTestAdmin } = require("./_seedTestAdmin");

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

  // garante admin mesmo no primeiro run
  await ensureTestAdmin();
});

beforeEach(async () => {
  await limparBanco();

  // como TRUNCATE apaga funcionario, precisa recriar admin sempre
  await ensureTestAdmin();
});

afterAll(async () => {
  await pool.end();
});
