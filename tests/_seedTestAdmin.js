// tests/_seedTestAdmin.js
const bcrypt = require("bcrypt");
const { pool } = require("../src/db");

async function ensureTestAdmin() {
  const usuario = process.env.TEST_ADMIN_USER || "admin.test";
  const senha = process.env.TEST_ADMIN_PASS || "Admin@123";
  const nome = process.env.TEST_ADMIN_NAME || "Admin Teste";
  const cargo = process.env.TEST_ADMIN_ROLE || "Admin";
  const nivel = Number(process.env.TEST_ADMIN_LEVEL || 2);

  const { rows } = await pool.query(
    "SELECT id FROM Funcionario WHERE Usuario = $1 LIMIT 1",
    [usuario],
  );
  if (rows.length > 0) return { usuario, senha };

  const rounds = Number(process.env.BCRYPT_ROUNDS_TEST || 4);
  const hash = await bcrypt.hash(senha, rounds);

  await pool.query(
    `INSERT INTO Funcionario (Nome, Cargo, Usuario, HashSenha, NivelAcesso)
     VALUES ($1, $2, $3, $4, $5)`,
    [nome, cargo, usuario, hash, nivel],
  );

  return { usuario, senha };
}

module.exports = { ensureTestAdmin };
