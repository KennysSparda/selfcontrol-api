require("dotenv").config();
const { pool } = require("../db");

// Função para obter todos os estoques
const obterEstoques = () => {
  return pool
    .query("SELECT * FROM Estoque")
    .then((res) => res.rows)
    .catch((err) => {
      throw err;
    });
};

// Função para criar um novo estoque
const criarEstoque = async (nome, descricao, local) => {
  if (!nome || !descricao || !local) {
    throw new Error(
      "Todos os campos são obrigatórios: nome, descricao e local.",
    );
  }

  const insertQuery = `INSERT INTO Estoque (Nome, Descricao, Local) VALUES ($1, $2, $3) RETURNING *`;
  try {
    const result = await pool.query(insertQuery, [nome, descricao, local]);
    return result.rows[0];
  } catch (error) {
    console.error("Erro ao inserir estoque:", error);
    throw new Error("Erro ao inserir estoque no banco de dados.");
  }
};

// Função para atualizar um estoque existente
const atualizarEstoque = (id, nome, descricao, local) => {
  const updateQuery = `UPDATE Estoque SET Nome = $1, Descricao = $2, Local = $3 WHERE ID = $4 RETURNING *`;
  return pool
    .query(updateQuery, [nome, descricao, local, id])
    .then((res) => res.rows[0])
    .catch((err) => {
      throw err;
    });
};

// Função para deletar um estoque
const deletarEstoque = (id) => {
  const deleteQuery = `DELETE FROM Estoque WHERE ID = $1`;
  return pool
    .query(deleteQuery, [id])
    .then(() => null)
    .catch((err) => {
      throw err;
    });
};

module.exports = {
  obterEstoques,
  criarEstoque,
  atualizarEstoque,
  deletarEstoque,
};
