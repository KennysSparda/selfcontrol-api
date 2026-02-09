// src/controllers/estoqueModel.js

const express = require("express");
const estoqueModel = require("../models/estoqueModel");

const router = express.Router();

// Rota para obter todos os estoques
router.get("/", async (req, res) => {
  try {
    const estoques = await estoqueModel.obterEstoques();
    res.status(200).json(estoques);
  } catch (err) {
    console.error("Erro ao buscar estoques", err.message);
    res.status(500).send("Erro ao buscar estoques");
  }
});

// Rota para criar um novo estoque
router.post("/", async (req, res) => {
  const { nome, descricao, local } = req.body;
  try {
    const novoEstoque = await estoqueModel.criarEstoque(nome, descricao, local);
    res.status(201).json(novoEstoque);
  } catch (err) {
    console.error("Erro ao inserir estoque", err.message);
    res.status(500).send("Erro ao inserir estoque");
  }
});

// Rota para atualizar um estoque
router.put("/:id", async (req, res) => {
  const { nome, descricao, local } = req.body;
  const id = req.params.id;
  try {
    const estoqueAtualizado = await estoqueModel.atualizarEstoque(
      id,
      nome,
      descricao,
      local,
    );
    res.status(200).json(estoqueAtualizado);
  } catch (err) {
    console.error("Erro ao atualizar estoque", err.message);
    res.status(500).send("Erro ao atualizar estoque");
  }
});

// Rota para deletar um estoque
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await estoqueModel.deletarEstoque(id);
    res.status(204).send();
  } catch (err) {
    console.error("Erro ao deletar estoque", err.message);
    res.status(500).send("Erro ao deletar estoque");
  }
});

module.exports = router;
