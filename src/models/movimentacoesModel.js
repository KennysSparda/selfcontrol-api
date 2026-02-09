const { pool } = require("../db");

const obterMovimentacoes = async () => {
  try {
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
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error("Erro ao obter movimentações: " + error.message);
  }
};

const criarMovimentacao = async (
  data,
  quantidade,
  tipo,
  produtoId,
  funcionarioId,
  estoqueId,
) => {
  try {
    const query = `
            INSERT INTO Movimentacoes (Data, Quantidade, Tipo, fk_Funcionario_ID, fk_Estoque_ID, fk_Produto_ID)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING ID, Data, Quantidade, Tipo, fk_Funcionario_ID, fk_Estoque_ID, fk_Produto_ID
        `;
    const values = [
      data,
      quantidade,
      tipo,
      funcionarioId,
      estoqueId,
      produtoId,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error("Erro ao criar movimentação: " + error.message);
  }
};

const atualizarMovimentacao = async (
  id,
  data,
  quantidade,
  tipo,
  produtoId,
  funcionarioId,
  estoqueId,
) => {
  try {
    const query = `
            UPDATE Movimentacoes
            SET Data = $1, Quantidade = $2, Tipo = $3, fk_Produto_ID = $4, fk_Funcionario_ID = $5, fk_Estoque_ID = $6
            WHERE ID = $7
            RETURNING ID, Data, Quantidade, Tipo, fk_Funcionario_ID, fk_Estoque_ID, fk_Produto_ID
        `;
    const values = [
      data,
      quantidade,
      tipo,
      produtoId,
      funcionarioId,
      estoqueId,
      id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error("Erro ao atualizar movimentação: " + error.message);
  }
};

const deletarMovimentacao = async (id) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const movimentacao = await obterMovimentacaoPorId(id, client);
    if (!movimentacao) {
      throw new Error(`Movimentação com ID ${id} não encontrada.`);
    }

    const query = `
            DELETE FROM Movimentacoes WHERE ID = $1 RETURNING *
        `;
    const result = await client.query(query, [id]);
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw new Error("Erro ao deletar movimentação: " + error.message);
  } finally {
    client.release();
  }
};

const obterMovimentacaoPorId = async (id, client = pool) => {
  try {
    const query = `
            SELECT m.ID, m.Data, m.Quantidade, m.Tipo as tipoid, m.fk_Funcionario_ID, m.fk_Estoque_ID as estoqueid, m.fk_Produto_ID,
            tm.Nome as NomeTipoMovimentacao,
            f.Nome as NomeFuncionario,
            e.Nome as NomeEstoque,
            p.Nome as NomeProduto,
            p.ID as ProdutoID
            FROM Movimentacoes m
            JOIN TipoMovimentacoes tm ON m.Tipo = tm.ID
            LEFT JOIN Funcionario f ON m.fk_Funcionario_ID = f.ID
            LEFT JOIN Estoque e ON m.fk_Estoque_ID = e.ID
            LEFT JOIN Produto p ON m.fk_Produto_ID = p.ID
            WHERE m.ID = $1;
        `;
    const result = await client.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error("Erro ao obter movimentação: " + error.message);
  }
};

module.exports = {
  obterMovimentacoes,
  criarMovimentacao,
  atualizarMovimentacao,
  deletarMovimentacao,
  obterMovimentacaoPorId,
};
