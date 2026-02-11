// src/services/movimentacoesService.js
const { pool } = require("../db");
const movimentacoesModel = require("../models/movimentacoesModel");
const produtoEstoqueService = require("./produtoEstoqueService");

function isTipoMovimentacaoValido(tipo) {
  return tipo === 1 || tipo === 2;
}

async function criarMovimentacao(
  Data,
  Quantidade,
  Tipo,
  fk_Produto_ID,
  fk_Funcionario_ID,
  estoqueid,
) {
  const client = await pool.connect();

  try {
    // validações "rápidas" antes de abrir transação pesada
    if (!isTipoMovimentacaoValido(Tipo)) {
      throw new Error(`Tipo de movimentação com ID ${Tipo} não encontrado.`);
    }

    await client.query("BEGIN");

    if (Tipo === 1) {
      await processarEntrada(client, Quantidade, fk_Produto_ID, estoqueid);
    }

    if (Tipo === 2) {
      const quantidadeDisponivel =
        await produtoEstoqueService.obterQuantidadeProdutoNoEstoque(
          fk_Produto_ID,
          estoqueid,
          client,
        );

      if (quantidadeDisponivel < Quantidade) {
        await client.query("ROLLBACK");
        return {
          success: false,
          message: "Quantidade insuficiente no estoque.",
        };
      }

      await processarSaida(client, Quantidade, fk_Produto_ID, estoqueid);
    }

    // grava movimentação no MESMO client (transação)
    const novaMovimentacao = await movimentacoesModel.criarMovimentacao(
      Data,
      Quantidade,
      Tipo,
      fk_Produto_ID,
      fk_Funcionario_ID,
      estoqueid,
      client,
    );

    await client.query("COMMIT");
    return { success: true, movimentacao: novaMovimentacao };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Falha no ROLLBACK:", rollbackError);
    }
    throw new Error("Erro ao criar movimentação: " + error.message);
  } finally {
    client.release();
  }
}

async function processarEntrada(client, Quantidade, fk_Produto_ID, estoqueid) {
  try {
    const existeProdutoNoEstoque =
      await produtoEstoqueService.verificarExistenciaProdutoNoEstoque(
        fk_Produto_ID,
        estoqueid,
        client,
      );

    if (existeProdutoNoEstoque) {
      await produtoEstoqueService.atualizarQuantidadeProdutoNoEstoqueService(
        fk_Produto_ID,
        estoqueid,
        Quantidade,
        client,
      );
      return;
    }

    await produtoEstoqueService.vincularProdutoAoEstoque(
      fk_Produto_ID,
      estoqueid,
      Quantidade,
      client,
    );
  } catch (error) {
    throw new Error("Erro ao processar entrada de produto: " + error.message);
  }
}

async function processarSaida(client, Quantidade, fk_Produto_ID, estoqueid) {
  try {
    const existeProdutoNoEstoque =
      await produtoEstoqueService.verificarExistenciaProdutoNoEstoque(
        fk_Produto_ID,
        estoqueid,
        client,
      );

    if (!existeProdutoNoEstoque) {
      throw new Error("Produto não existe no estoque.");
    }

    await produtoEstoqueService.atualizarQuantidadeProdutoNoEstoqueService(
      fk_Produto_ID,
      estoqueid,
      -Quantidade,
      client,
    );
  } catch (error) {
    throw new Error("Erro ao processar saída de produto: " + error.message);
  }
}

module.exports = {
  criarMovimentacao,
};
