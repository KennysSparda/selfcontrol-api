require("dotenv").config();
const { pool } = require("../db");

const obterProdutoEstoque = async () => {
  try {
    const query = `
            SELECT pe.ID as ProdutoEstoqueID, pe.fk_Produto_ID as ProdutoID, pe.fk_Estoque_ID as EstoqueID, pe.Quantidade,
            p.Nome as NomeProduto, p.Descricao as DescricaoProduto, p.Valor as ValorProduto, e.Nome as NomeEstoque
            FROM ProdutoEstoque pe
            JOIN Produto p ON pe.fk_Produto_ID = p.ID
            JOIN Estoque e ON pe.fk_Estoque_ID = e.ID
        `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error("Erro ao obter ProdutoEstoque: " + error.message);
  }
};

const vincularProdutoAoEstoque = async (produtoId, estoqueId, quantidade) => {
  try {
    const insertQuery = `
            INSERT INTO ProdutoEstoque (fk_Produto_ID, fk_Estoque_ID, Quantidade)
            VALUES ($1, $2, $3)
            RETURNING ID as ProdutoEstoqueID, fk_Produto_ID as ProdutoID, fk_Estoque_ID as EstoqueID, Quantidade
        `;
    const insertValues = [produtoId, estoqueId, quantidade];
    const result = await pool.query(insertQuery, insertValues);
    return result.rows[0];
  } catch (error) {
    throw new Error("Erro ao vincular Produto ao Estoque: " + error.message);
  }
};

const atualizarQuantidadeProdutoNoEstoqueModel = async (
  produtoEstoqueId,
  produtoId,
  estoqueId,
  quantidade,
) => {
  try {
    const query = `
            UPDATE ProdutoEstoque SET fk_Produto_ID = $1, fk_Estoque_ID = $2, Quantidade = $3
            WHERE ID = $4
            RETURNING ID as ProdutoEstoqueID, fk_Produto_ID as ProdutoID, fk_Estoque_ID as EstoqueID, Quantidade
        `;
    const values = [produtoId, estoqueId, quantidade, produtoEstoqueId];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error(
      "Erro ao atualizar quantidade de Produto no Estoque (Model): " +
        error.message,
    );
  }
};

const removerProdutoDoEstoque = async (produtoEstoqueId) => {
  try {
    const query = `
            DELETE FROM ProdutoEstoque WHERE ID = $1
        `;
    const values = [produtoEstoqueId];
    await pool.query(query, values);
  } catch (error) {
    throw new Error("Erro ao remover Produto do Estoque: " + error.message);
  }
};

const obterProdutosPorEstoque = async (estoqueId) => {
  try {
    const query = `
            SELECT pe.ID as ProdutoEstoqueID, pe.fk_Produto_ID as ProdutoID, pe.fk_Estoque_ID as EstoqueID, pe.Quantidade,
            p.Nome as NomeProduto, p.Valor as ValorProduto
            FROM ProdutoEstoque pe
            JOIN Produto p ON pe.fk_Produto_ID = p.ID
            WHERE pe.fk_Estoque_ID = $1
        `;
    const values = [estoqueId];
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    throw new Error("Erro ao obter produtos por estoque: " + error.message);
  }
};

const obterProdutoEstoquePorProdutoEEstoque = async (
  fk_Produto_ID,
  fk_Estoque_ID,
) => {
  try {
    const query = `
            SELECT pe.ID, pe.fk_Produto_ID as ProdutoID, pe.fk_Estoque_ID as EstoqueID, pe.Quantidade
            FROM ProdutoEstoque pe
            WHERE pe.fk_Produto_ID = $1 AND pe.fk_Estoque_ID = $2
        `;
    const values = [fk_Produto_ID, fk_Estoque_ID];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null; // Se não encontrou nenhum resultado, retorna null ou um valor indicativo de não encontrado
    }

    return result.rows[0]; // Retorna o primeiro resultado encontrado
  } catch (error) {
    throw new Error(
      "Erro ao obter ProdutoEstoque por Produto e Estoque: " + error.message,
    );
  }
};

module.exports = {
  obterProdutoEstoque,
  vincularProdutoAoEstoque,
  atualizarQuantidadeProdutoNoEstoqueModel,
  removerProdutoDoEstoque,
  obterProdutosPorEstoque,
  obterProdutoEstoquePorProdutoEEstoque,
};
