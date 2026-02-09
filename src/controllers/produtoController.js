// src/controllers/produtoController.js

const express = require("express");
const produtoModel = require("../models/produtoModel");

const router = express.Router();

// GET /produto -> lista
router.get("/", async (req, res) => {
  try {
    const produtos = await produtoModel.obterProdutos();
    res.status(200).json(produtos);
  } catch (err) {
    console.error("Erro ao buscar produtos", err.message);
    res.status(500).json({ message: "Erro ao buscar produtos" });
  }
});

// GET /produto/:id -> um item
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const rows = await produtoModel.obterProdutosPorID(id);
    const produto = rows[0];

    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    res.status(200).json(produto);
  } catch (err) {
    console.error("Erro ao buscar produto", err.message);
    res.status(500).json({ message: "Erro ao buscar produto" });
  }
});

// POST /produto -> cria e retorna o recurso criado
router.post("/", async (req, res) => {
  try {
    const { nome, descricao, valor } = req.body;

    if (!nome || String(nome).trim() === "") {
      return res.status(400).json({ message: "nome é obrigatório" });
    }

    const novoProduto = await produtoModel.criarProduto(nome, descricao, valor);

    res.status(201).location(`/produto/${novoProduto.id}`).json(novoProduto);
  } catch (err) {
    console.error("Erro ao inserir produto", err.message);

    if (err.message && err.message.toLowerCase().includes("obrigatório")) {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: "Erro ao inserir produto" });
  }
});

// PUT /produto/:id -> atualiza e retorna o recurso atualizado
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const { nome, descricao, valor } = req.body;
    if (!nome || String(nome).trim() === "") {
      return res.status(400).json({ message: "nome é obrigatório" });
    }

    const produtoAtualizado = await produtoModel.atualizarProduto(
      id,
      nome,
      descricao,
      valor,
    );

    if (!produtoAtualizado) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    res.status(200).json(produtoAtualizado);
  } catch (err) {
    console.error("Erro ao atualizar produto", err.message);
    res.status(500).json({ message: "Erro ao atualizar produto" });
  }
});

// DELETE /produto/:id -> 204 No Content (padrão REST)
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "ID inválido" });
    }

    await produtoModel.deletarProduto(id);

    return res.status(204).send();
  } catch (err) {
    console.error("Erro ao deletar produto", err.message);
    res.status(500).json({ message: "Erro ao deletar produto" });
  }
});

module.exports = router;
