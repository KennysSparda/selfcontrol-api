// src/app.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const produtoController = require("./controllers/produtoController");
const estoqueController = require("./controllers/estoqueController");
const produtoEstoqueController = require("./controllers/produtoEstoqueController");
const funcionarioController = require("./controllers/funcionarioController");
const movimentacoesController = require("./controllers/movimentacoesController");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/produto", produtoController);
app.use("/estoque", estoqueController);
app.use("/produto-estoque", produtoEstoqueController);
app.use("/funcionario", funcionarioController);
app.use("/movimentacoes", movimentacoesController);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Algo deu errado!");
});

module.exports = app;
