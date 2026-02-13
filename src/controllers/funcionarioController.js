// routes/funcionarioRoutes.js
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const express = require("express");
const router = express.Router();
const FuncionarioModel = require("../models/funcionarioModel");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Muitas tentativas. Tente novamente mais tarde." },
});

// Rota para listar todos os funcionários
router.get("/", async (req, res) => {
  try {
    const funcionarios = await FuncionarioModel.obterFuncionarios();
    res.status(200).json(funcionarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar funcionários." });
  }
});

// Rota para criar um novo funcionário
router.post("/", async (req, res) => {
  try {
    const { nome, cargo, usuario, senha, nivelacesso } = req.body;
    const novoFuncionario = {
      nome,
      cargo,
      usuario,
      senha,
      nivelacesso,
    };
    const funcionarioID =
      await FuncionarioModel.createFuncionario(novoFuncionario);
    res
      .status(201)
      .json({ id: funcionarioID, message: "Funcionário criado com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar funcionário." });
  }
});

// Rota para validar credenciais de login
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      return res
        .status(400)
        .json({ message: "Usuário e senha são obrigatórios." });
    }

    const dados = await FuncionarioModel.validarCredenciais(usuario, senha);

    // resposta genérica (não revelar se usuário existe)
    if (!dados) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET não definido");
      return res.status(500).json({ message: "Configuração inválida." });
    }

    const token = jwt.sign(
      { nivelacesso: dados.nivelacesso },
      process.env.JWT_SECRET,
      {
        subject: String(dados.id),
        expiresIn: process.env.JWT_EXPIRES_IN || "8h",
      },
    );

    return res.json({
      token,
      funcionario: {
        id: dados.id,
        nome: dados.nome,
        usuario: dados.usuario,
        nivelacesso: dados.nivelacesso,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao validar credenciais." });
  }
});

// Rota para obter um funcionário por ID
router.get("/:userId", async (req, res) => {
  try {
    const id = Number(req.params.userId);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "userId inválido." });
    }

    const funcionario = await FuncionarioModel.obterFuncionarioPorId(id);

    if (!funcionario) {
      return res.status(404).json({ message: "Funcionário não encontrado." });
    }

    return res.status(200).json(funcionario);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar funcionário." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const funcionarioID = req.params.id;
    const { nome, cargo, usuario, senha, nivelacesso } = req.body;
    const dadosAtualizados = {
      nome,
      cargo,
      usuario,
      senha,
      nivelacesso,
    };
    await FuncionarioModel.updateFuncionario(funcionarioID, dadosAtualizados);
    res.status(200).json({ message: "Funcionário atualizado com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar funcionário." });
  }
});

// Rota para deletar um funcionário
router.delete("/:id", async (req, res) => {
  try {
    const funcionarioID = req.params.id;
    await FuncionarioModel.deleteFuncionario(funcionarioID);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao deletar funcionário." });
  }
});

module.exports = router;
