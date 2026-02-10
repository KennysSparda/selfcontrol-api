const express = require("express");
const ProdutoEstoqueModel = require("../models/produtoEstoqueModel");

const router = express.Router();

// Rota para obter todos os registros de Produto_Estoque
router.get("/", async (req, res) => {
  try {
    const produtosEstoque = await ProdutoEstoqueModel.obterProdutoEstoque();
    res.status(200).json(produtosEstoque);
  } catch (err) {
    console.error("Erro ao buscar produtos em estoque", err.message);
    res.status(500).json({ message: "Erro ao buscar produtos em estoque" });
  }
});

// Rota para obter todos os produtos vinculados a um estoque específico
router.get("/:id", async (req, res) => {
  const estoqueId = req.params.id;
  try {
    const produtosPorEstoque =
      await ProdutoEstoqueModel.obterProdutosPorEstoque(estoqueId);
    res.status(200).json(produtosPorEstoque);
  } catch (err) {
    console.error(
      `Erro ao buscar produtos do estoque com ID ${estoqueId}`,
      err.message,
    );
    res.status(500).json({
      message: `Erro ao buscar produtos do estoque com ID ${estoqueId}`,
    });
  }
});

// Rota para criar uma nova entrada de Produto_Estoque
router.post("/", async (req, res) => {
  const { ProdutoID, EstoqueID, Quantidade } = req.body;

  if (ProdutoID && EstoqueID && Quantidade) {
    try {
      const novaEntrada = await ProdutoEstoqueModel.vincularProdutoAoEstoque(
        ProdutoID,
        EstoqueID,
        Quantidade,
      );
      res.status(201).json(novaEntrada);
    } catch (err) {
      console.error("Erro ao inserir entrada de Produto_Estoque", err.message);
      res
        .status(500)
        .json({ message: "Erro ao inserir entrada de Produto_Estoque" });
    }
  } else {
    console.error(
      `Alguns dados nao estao chegando: ProdutoID: ${ProdutoID}, EstoqueID: ${EstoqueID}, Qntd: ${Quantidade}`,
    );
    res.status(500).json({
      message: `Alguns dados nao estao chegando: ProdutoID: ${ProdutoID}, EstoqueID: ${EstoqueID}, Qntd: ${Quantidade}`,
    });
  }
});

// Rota para atualizar um registro de Produto_Estoque
router.put("/:id", async (req, res) => {
  const { ProdutoID, EstoqueID, Quantidade } = req.body;
  const ProdutoEstoqueID = req.params.id;
  try {
    const produtoEstoqueAtualizado =
      await ProdutoEstoqueModel.atualizarQuantidadeProdutoNoEstoque(
        ProdutoEstoqueID,
        ProdutoID,
        EstoqueID,
        Quantidade,
      );
    res.status(200).json(produtoEstoqueAtualizado);
  } catch (err) {
    console.error("Erro ao atualizar produto em estoque", err.message);
    res.status(500).json({ message: "Erro ao atualizar produto em estoque" });
  }
});

// Rota para deletar um registro de Produto_Estoque
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await ProdutoEstoqueModel.removerProdutoDoEstoque(id);
    res.status(204).send();
  } catch (err) {
    console.error("Erro ao deletar produto em estoque", err.message);
    res.status(500).json({ message: "Erro ao deletar produto em estoque" });
  }
});

module.exports = router;
