// src/models/databaseModel.js
const bcrypt = require("bcrypt");
const { pool } = require("../db");

const createTablesQuery = `
CREATE TABLE IF NOT EXISTS Produto (
  ID SERIAL PRIMARY KEY,
  Nome VARCHAR(255) NOT NULL,
  Valor DECIMAL(10, 2) NOT NULL,
  Descricao VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS Estoque (
  ID SERIAL PRIMARY KEY,
  Nome VARCHAR(255) NOT NULL,
  Descricao VARCHAR(500),
  Local VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS Funcionario (
  ID SERIAL PRIMARY KEY,
  Nome VARCHAR(255) NOT NULL,
  Cargo VARCHAR(255),
  Usuario VARCHAR(255) NOT NULL,
  HashSenha VARCHAR(255) NOT NULL,
  NivelAcesso INTEGER DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS funcionario_usuario_unique_idx
  ON Funcionario (Usuario);

CREATE TABLE IF NOT EXISTS ProdutoEstoque (
  ID SERIAL PRIMARY KEY,
  Quantidade INTEGER NOT NULL CHECK (Quantidade >= 0),
  fk_Produto_ID INTEGER NOT NULL,
  fk_Estoque_ID INTEGER NOT NULL,
  CONSTRAINT FK_ProdutoEstoque_Produto FOREIGN KEY (fk_Produto_ID) REFERENCES Produto (ID),
  CONSTRAINT FK_ProdutoEstoque_Estoque FOREIGN KEY (fk_Estoque_ID) REFERENCES Estoque (ID)
);

CREATE TABLE IF NOT EXISTS Movimentacoes (
  ID SERIAL PRIMARY KEY,
  Data TIMESTAMP NOT NULL DEFAULT NOW(),
  Quantidade INTEGER NOT NULL CHECK (Quantidade <> 0),
  Tipo VARCHAR(50) NOT NULL,
  fk_Funcionario_ID INTEGER,
  fk_Estoque_ID INTEGER,
  fk_Produto_ID INTEGER,
  CONSTRAINT FK_Movimentacoes_Funcionario FOREIGN KEY (fk_Funcionario_ID) REFERENCES Funcionario (ID),
  CONSTRAINT FK_Movimentacoes_Estoque FOREIGN KEY (fk_Estoque_ID) REFERENCES Estoque (ID),
  CONSTRAINT FK_Movimentacoes_Produto FOREIGN KEY (fk_Produto_ID) REFERENCES Produto (ID)
);
`;

async function seedPrimeiroFuncionario() {
  if (process.env.NODE_ENV === "test") return;

  const adminUser = process.env.ADMIN_USER || "admin";
  const adminPass = process.env.ADMIN_PASS || "admin";
  const adminNome = process.env.ADMIN_NAME || "Administrador";
  const adminCargo = process.env.ADMIN_ROLE || "Admin";
  const adminNivel = Number(process.env.ADMIN_LEVEL || 2);

  const { rows } = await pool.query("SELECT 1 FROM Funcionario LIMIT 1");
  if (rows.length > 0) return;

  const hash = await bcrypt.hash(adminPass, 10);

  const insertQuery = `
    INSERT INTO Funcionario (Nome, Cargo, Usuario, HashSenha, NivelAcesso)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING ID, Nome, Cargo, Usuario, NivelAcesso
  `;

  const inserted = await pool.query(insertQuery, [
    adminNome,
    adminCargo,
    adminUser,
    hash,
    adminNivel,
  ]);

  console.log("Primeiro funcionário criado:", inserted.rows[0]);
}

async function initDatabase(options = {}) {
  const silent = options.silent === true;

  await pool.query(createTablesQuery);
  if (!silent) console.log("Tabelas criadas/atualizadas com sucesso");

  await seedPrimeiroFuncionario();

  if (!silent) {
    const listTablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    const res = await pool.query(listTablesQuery);
    console.log("Tabelas disponíveis no banco de dados:");
    res.rows.forEach((row) => console.log(row.table_name));
  }
}

module.exports = { initDatabase };
