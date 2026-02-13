// src/models/movimentacoesModel.js
const { pool } = require("../db");

function getDb(client) {
  return client && typeof client.query === "function" ? client : pool;
}

async function obterMovimentacoes(client = null) {
  try {
    const db = getDb(client);
    const query = `
      SELECT 
        m.ID,
        m.Data,
        m.Quantidade,
        m.Tipo,
        f.Nome as NomeFuncionario,
        e.Nome as NomeEstoque,
        p.Nome as NomeProduto
      FROM 
        Movimentacoes m
        LEFT JOIN Funcionario f ON m.fk_Funcionario_ID = f.ID
        LEFT JOIN Estoque e ON m.fk_Estoque_ID = e.ID
        LEFT JOIN Produto p ON m.fk_Produto_ID = p.ID
      ORDER BY 
        m.ID;
    `;
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    throw new Error("Erro ao obter movimentações: " + error.message);
  }
}

async function criarMovimentacao(
  data,
  quantidade,
  tipo,
  produtoId,
  funcionarioId,
  estoqueId,
  client = null,
) {
  try {
    const db = getDb(client);
    const query = `
      INSERT INTO Movimentacoes
        (Data, Quantidade, Tipo, fk_Funcionario_ID, fk_Estoque_ID, fk_Produto_ID)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING
        ID, Data, Quantidade, Tipo, fk_Funcionario_ID, fk_Estoque_ID, fk_Produto_ID
    `;
    const values = [
      data,
      quantidade,
      tipo,
      funcionarioId,
      estoqueId,
      produtoId,
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error("Erro ao criar movimentação: " + error.message);
  }
}

module.exports = {
  obterMovimentacoes,
  criarMovimentacao,
};
