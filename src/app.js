// src/app.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const requestLogger = require("./middleware/requestLogger");
const auth = require("./middleware/auth");
const requireAdmin = require("./middleware/requireAdmin");

const produtoController = require("./controllers/produtoController");
const estoqueController = require("./controllers/estoqueController");
const produtoEstoqueController = require("./controllers/produtoEstoqueController");
const funcionarioController = require("./controllers/funcionarioController");
const movimentacoesController = require("./controllers/movimentacoesController");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.NODE_ENV != "test") app.use(requestLogger);

app.use((req, res, next) => {
  if (req.path === "/funcionario/login") return next();
  return auth(true)(req, res, next);
});

// Rotas protegidas
app.use("/produto", produtoController);
app.use("/estoque", estoqueController);
app.use("/produto-estoque", produtoEstoqueController);
app.use("/movimentacoes", movimentacoesController);

// /funcionario: login livre, resto só admin
app.use(
  "/funcionario",
  (req, res, next) => {
    if (req.path === "/login") return next();
    return requireAdmin(req, res, next);
  },
  funcionarioController,
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Algo deu errado!" });
});

module.exports = app;
