// tests/_helpers.js
const request = require("supertest");
const app = require("../src/app");
const { pool } = require("../src/db");

let _token = null;

async function getAuthToken() {
  if (_token) return _token;

  const usuario = process.env.TEST_ADMIN_USER || "admin.test";
  const senha = process.env.TEST_ADMIN_PASS || "Admin@123";

  const res = await request(app)
    .post("/funcionario/login")
    .send({ usuario, senha });

  if (res.statusCode !== 200 || !res.body.token) {
    throw new Error(
      `Falha ao obter token de teste. status=${res.statusCode} body=${JSON.stringify(res.body)}`,
    );
  }

  _token = res.body.token;
  return _token;
}

async function getAuthHeader() {
  const token = await getAuthToken();
  return { Authorization: `Bearer ${token}` };
}

// wrapper: sempre injeta Authorization
async function authRequest() {
  const headers = await getAuthHeader();

  return {
    get: (url) => request(app).get(url).set(headers),
    post: (url) => request(app).post(url).set(headers),
    put: (url) => request(app).put(url).set(headers),
    delete: (url) => request(app).delete(url).set(headers),
  };
}

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

  const api = await authRequest();
  const res = await api.post("/produto").send(payload);

  expect(res.statusCode).toBe(201);
  expect(res.body.id).toBeDefined();

  return res.body;
}

async function criarEstoque(overrides = {}) {
  const payload = {
    nome: "Estoque Teste",
    descricao: "Estoque para testes",
    local: "Local Teste",
    ...overrides,
  };

  const api = await authRequest();
  const res = await api.post("/estoque").send(payload);

  expect(res.statusCode).toBe(201);
  expect(res.body.id).toBeDefined();

  return res.body;
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

  const api = await authRequest();
  const res = await api.post("/funcionario").send(payload);

  expect(res.statusCode).toBe(201);
  expect(res.body.id).toBeDefined();

  return res.body;
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

  const api = await authRequest();
  const res = await api.post("/movimentacoes").send(payload);

  expect(res.statusCode).toBe(201);
  return res.body;
}

async function obterQuantidadeProdutoNoEstoque(produtoId, estoqueId) {
  const api = await authRequest();
  const res = await api.get(`/produto-estoque/${estoqueId}`);

  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);

  const row = res.body.find((r) => Number(r.produtoid) === Number(produtoId));
  return row ? Number(row.quantidade) : 0;
}

module.exports = {
  request,
  app,
  pool,
  getAuthToken,
  getAuthHeader,
  authRequest,
  criarProduto,
  criarEstoque,
  criarFuncionario,
  criarMovimentacao,
  obterQuantidadeProdutoNoEstoque,
};
