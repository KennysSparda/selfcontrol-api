// src/services/produtoEstoqueService.js
const produtoEstoqueModel = require("../models/produtoEstoqueModel");

const obterProdutoEstoque = async (client = null) => {
  try {
    return await produtoEstoqueModel.obterProdutoEstoque(client);
  } catch (error) {
    throw new Error("Erro ao obter ProdutoEstoque: " + error.message);
  }
};

const vincularProdutoAoEstoque = async (
  produtoId,
  estoqueId,
  quantidade,
  client = null,
) => {
  try {
    const produtoEstoque =
      await produtoEstoqueModel.obterProdutoEstoquePorProdutoEEstoque(
        produtoId,
        estoqueId,
        client,
      );

    if (produtoEstoque) {
      // Se já existe, atualizar a quantidade
      const existingQuantidade =
        Number(produtoEstoque.quantidade) + Number(quantidade);
      return await produtoEstoqueModel.atualizarQuantidadeProdutoNoEstoqueModel(
        produtoEstoque.id,
        produtoId,
        estoqueId,
        existingQuantidade,
        client,
      );
    }

    // Caso contrário, inserir um novo registro
    return await produtoEstoqueModel.vincularProdutoAoEstoque(
      produtoId,
      estoqueId,
      quantidade,
      client,
    );
  } catch (error) {
    throw new Error("Erro ao vincular Produto ao Estoque: " + error.message);
  }
};

const removerProdutoDoEstoque = async (produtoId, estoqueId, client = null) => {
  try {
    const produtoEstoque =
      await produtoEstoqueModel.obterProdutoEstoquePorProdutoEEstoque(
        produtoId,
        estoqueId,
        client,
      );

    if (!produtoEstoque) {
      throw new Error("Produto não encontrado no estoque");
    }

    await produtoEstoqueModel.removerProdutoDoEstoque(
      produtoEstoque.id,
      client,
    );
  } catch (error) {
    throw new Error("Erro ao remover Produto do Estoque: " + error.message);
  }
};

const atualizarQuantidadeProdutoNoEstoqueService = async (
  produtoId,
  estoqueId,
  quantidade,
  client = null,
) => {
  try {
    const produtoEstoque =
      await produtoEstoqueModel.obterProdutoEstoquePorProdutoEEstoque(
        produtoId,
        estoqueId,
        client,
      );

    if (!produtoEstoque) {
      throw new Error("Produto não encontrado no estoque.");
    }

    // FIX: antes era const e tentava reatribuir (bug)
    let novaQuantidade = Number(produtoEstoque.quantidade) + Number(quantidade);

    if (novaQuantidade < 0) {
      novaQuantidade = 0;
    }

    return await produtoEstoqueModel.atualizarQuantidadeProdutoNoEstoqueModel(
      produtoEstoque.id,
      produtoId,
      estoqueId,
      novaQuantidade,
      client,
    );
  } catch (error) {
    throw new Error(
      "Erro ao atualizar quantidade de Produto no Estoque (Service): " +
        error.message,
    );
  }
};

const obterProdutosPorEstoque = async (estoqueId, client = null) => {
  try {
    return await produtoEstoqueModel.obterProdutosPorEstoque(estoqueId, client);
  } catch (error) {
    throw new Error("Erro ao obter produtos por estoque: " + error.message);
  }
};

const verificarExistenciaProdutoNoEstoque = async (
  produtoId,
  estoqueId,
  client = null,
) => {
  try {
    const produtoEstoque =
      await produtoEstoqueModel.obterProdutoEstoquePorProdutoEEstoque(
        produtoId,
        estoqueId,
        client,
      );
    return produtoEstoque !== null;
  } catch (error) {
    throw new Error(
      "Erro ao verificar existência do Produto no Estoque: " + error.message,
    );
  }
};

const obterQuantidadeProdutoNoEstoque = async (
  produtoId,
  estoqueId,
  client = null,
) => {
  try {
    const produtoEstoque =
      await produtoEstoqueModel.obterProdutoEstoquePorProdutoEEstoque(
        produtoId,
        estoqueId,
        client,
      );

    if (!produtoEstoque) {
      throw new Error("Produto não encontrado no estoque.");
    }

    return Number(produtoEstoque.quantidade);
  } catch (error) {
    throw new Error(
      "Erro ao obter quantidade de Produto no Estoque: " + error.message,
    );
  }
};

module.exports = {
  obterProdutoEstoque,
  vincularProdutoAoEstoque,
  removerProdutoDoEstoque,
  atualizarQuantidadeProdutoNoEstoqueService,
  obterProdutosPorEstoque,
  verificarExistenciaProdutoNoEstoque,
  obterQuantidadeProdutoNoEstoque,
};
