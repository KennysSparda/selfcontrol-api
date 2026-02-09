require("dotenv").config();
const { pool } = require("../db");

// Função para obter todos os produtos
const obterProdutos = () => {
  return pool
    .query("SELECT * FROM Produto")
    .then((res) => res.rows)
    .catch((err) => {
      throw err;
    });
};

const obterProdutosPorID = (id) => {
  return pool
    .query(
      "SELECT ID as ProdutoID, Nome as nomeproduto, Valor as valorproduto FROM Produto WHERE ID = $1",
      [id],
    )
    .then((res) => res.rows)
    .catch((err) => {
      throw err;
    });
};

// Função para criar um novo produto
const criarProduto = (nome, descricao, valor) => {
  if (!nome || nome.trim() === "") {
    return Promise.reject(new Error("O nome do produto é obrigatório"));
  }

  const insertQuery = `INSERT INTO Produto (Nome, Descricao, Valor) VALUES ($1, $2, $3) RETURNING *`;
  return pool
    .query(insertQuery, [nome, descricao, valor])
    .then((res) => res.rows[0])
    .catch((err) => {
      throw err;
    });
};

// Função para atualizar um produto existente
const atualizarProduto = (id, nome, descricao, valor) => {
  const updateQuery = `UPDATE Produto SET Nome = $1, Descricao = $2, Valor = $3 WHERE ID = $4 RETURNING *`;
  return pool
    .query(updateQuery, [nome, descricao, valor, id])
    .then((res) => res.rows[0])
    .catch((err) => {
      throw err;
    });
};

// Função para deletar um produto
const deletarProduto = (id) => {
  const deleteQuery = `DELETE FROM Produto WHERE ID = $1`;
  return pool
    .query(deleteQuery, [id])
    .then(() => null)
    .catch((err) => {
      throw err;
    });
};

module.exports = {
  obterProdutos,
  obterProdutosPorID,
  criarProduto,
  atualizarProduto,
  deletarProduto,
};
