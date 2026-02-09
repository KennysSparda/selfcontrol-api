// tests/_helpers.js
const request = require("supertest");
const app = require("../src/app");
const { pool } = require("../src/db");

function nowISO() {
  return new Date().toISOString();
}

async function criarProduto(overrides = {}) {
  const payload = {
    nome: "Produto Teste",
    descricao: "Produto para testes",
    valor: "10.00",
    ...overrides,
  };

  const res = await request(app).post("/produto").send(payload);
  expect(res.statusCode).toBe(201);
  expect(res.body.id).toBeDefined();

  return res.body; // { id, ... }
}

async function criarEstoque(overrides = {}) {
  const payload = {
    nome: "Estoque Teste",
    descricao: "Estoque para testes",
    local: "Local Teste",
    ...overrides,
  };

  const res = await request(app).post("/estoque").send(payload);
  expect(res.statusCode).toBe(201);
  expect(res.body.id).toBeDefined();

  return res.body; // { id, ... }
}

async function criarFuncionario(overrides = {}) {
  const payload = {
    nome: "Funcionario Teste",
    cargo: "Cargo",
    usuario: "func.teste",
    senha: "Senha@123",
    nivelacesso: 1,
    ...overrides,
  };

  const res = await request(app).post("/funcionario").send(payload);
  expect(res.statusCode).toBe(201);
  expect(res.body.id).toBeDefined();

  return res.body; // { id, message }
}

async function criarMovimentacao(overrides = {}) {
  const {
    Data = nowISO(),
    Quantidade = 1,
    Tipo = 1,
    fk_Produto_ID,
    fk_Funcionario_ID,
    fk_Estoque_ID,
  } = overrides;

  const payload = {
    Data,
    Quantidade,
    Tipo,
    fk_Produto_ID,
    fk_Funcionario_ID,
    fk_Estoque_ID,
  };

  const res = await request(app).post("/movimentacoes").send(payload);
  expect(res.statusCode).toBe(201);

  return res.body;
}

async function obterQuantidadeProdutoNoEstoque(produtoId, estoqueId) {
  const res = await request(app).get(`/produto-estoque/${estoqueId}`);
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);

  const row = res.body.find((r) => Number(r.produtoid) === Number(produtoId));
  return row ? Number(row.quantidade) : 0;
}

module.exports = {
  request,
  app,
  criarProduto,
  criarEstoque,
  criarFuncionario,
  criarMovimentacao,
  obterQuantidadeProdutoNoEstoque,
};
