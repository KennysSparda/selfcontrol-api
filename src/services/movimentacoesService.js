const movimentacoesModel = require("../models/movimentacoesModel");
const produtoEstoqueService = require("./produtoEstoqueService");

const obterTipoMovimentacao = (id) => {
  return id === 1 || id === 2 ? true : false;
};

const criarMovimentacao = async (
  Data,
  Quantidade,
  Tipo,
  fk_Produto_ID,
  fk_Funcionario_ID,
  estoqueid,
) => {
  try {
    const tipoMovimentacao = await obterTipoMovimentacao(Tipo);
    if (!tipoMovimentacao) {
      throw new Error(`Tipo de movimentação com ID ${Tipo} não encontrado.`);
    }

    if (Tipo === 1) {
      // ID 1 representa movimentação de entrada
      await processarEntrada(Quantidade, fk_Produto_ID, estoqueid);
    } else if (Tipo === 2) {
      // ID 2 representa movimentação de saída
      const quantidadeDisponivel =
        await produtoEstoqueService.obterQuantidadeProdutoNoEstoque(
          fk_Produto_ID,
          estoqueid,
        );
      if (quantidadeDisponivel < Quantidade) {
        return {
          success: false,
          message: "Quantidade insuficiente no estoque.",
        };
      }
      await processarSaida(Quantidade, fk_Produto_ID, estoqueid);
    } else {
      throw new Error(`Tipo de movimentação com ID ${Tipo} não suportado.`);
    }

    // Criar a movimentação após processar entrada ou saída
    const novaMovimentacao = await movimentacoesModel.criarMovimentacao(
      Data,
      Quantidade,
      Tipo,
      fk_Produto_ID,
      fk_Funcionario_ID,
      estoqueid,
    );
    return { success: true, movimentacao: novaMovimentacao };
  } catch (error) {
    throw new Error("Erro ao criar movimentação: " + error.message);
  }
};

const processarEntrada = async (Quantidade, fk_Produto_ID, estoqueid) => {
  try {
    const existeProdutoNoEstoque =
      await produtoEstoqueService.verificarExistenciaProdutoNoEstoque(
        fk_Produto_ID,
        estoqueid,
      );

    if (existeProdutoNoEstoque) {
      await produtoEstoqueService.atualizarQuantidadeProdutoNoEstoqueService(
        fk_Produto_ID,
        estoqueid,
        Quantidade,
      );
    } else {
      await produtoEstoqueService.vincularProdutoAoEstoque(
        fk_Produto_ID,
        estoqueid,
        Quantidade,
      );
    }
  } catch (error) {
    throw new Error("Erro ao processar entrada de produto: " + error.message);
  }
};

const processarSaida = async (Quantidade, fk_Produto_ID, estoqueid) => {
  try {
    const existeProdutoNoEstoque =
      await produtoEstoqueService.verificarExistenciaProdutoNoEstoque(
        fk_Produto_ID,
        estoqueid,
      );

    if (existeProdutoNoEstoque) {
      await produtoEstoqueService.atualizarQuantidadeProdutoNoEstoqueService(
        fk_Produto_ID,
        estoqueid,
        -Quantidade,
      );
    } else {
      throw new Error("Produto não existe no estoque.");
    }
  } catch (error) {
    throw new Error("Erro ao processar saída de produto: " + error.message);
  }
};

module.exports = {
  criarMovimentacao,
};
