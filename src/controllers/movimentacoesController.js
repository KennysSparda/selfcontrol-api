const express = require("express");
const movimentacoesService = require("../services/movimentacoesService");
const movimentacoesModel = require("../models/movimentacoesModel");

const router = express.Router();

// Rota para obter todas as movimentações
router.get("/", async (req, res) => {
  try {
    const movimentacoes = await movimentacoesModel.obterMovimentacoes();
    res.json(movimentacoes);
  } catch (err) {
    console.error("Erro ao buscar movimentações", err.message);
    res.status(500).send("Erro ao buscar movimentações");
  }
});

// Rota para criar uma nova movimentação
router.post("/", async (req, res) => {
  const {
    Data,
    Quantidade,
    Tipo,
    fk_Produto_ID,
    fk_Funcionario_ID,
    fk_Estoque_ID,
  } = req.body;

  try {
    const novaMovimentacao = await movimentacoesService.criarMovimentacao(
      Data,
      Quantidade,
      Tipo,
      fk_Produto_ID,
      fk_Funcionario_ID,
      fk_Estoque_ID,
    );
    res.status(201).json(novaMovimentacao);
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      console.error("Erro ao inserir movimentação", err.message);
    }

    return res.status(500).json({ message: "Erro ao inserir movimentação" });
  }
});

module.exports = router;
