// tests/movimentacoes.test.js
const {
  authRequest,
  criarProduto,
  criarEstoque,
  criarFuncionario,
  criarMovimentacao,
  obterQuantidadeProdutoNoEstoque,
} = require("./_helpers");

async function setupBase(api) {
  const produto = await criarProduto({ nome: "Produto Mov" });
  const estoque = await criarEstoque({ nome: "Estoque Mov" });
  await criarFuncionario({ usuario: "mov.func", nome: "Funcionario Mov" });

  const funcionarios = await api.get("/funcionario");
  expect(funcionarios.statusCode).toBe(200);

  const funcionario = funcionarios.body.find((f) => f.usuario === "mov.func");
  expect(funcionario).toBeDefined();

  return { produto, estoque, funcionario };
}

async function vincularProdutoNoEstoque(api, produtoId, estoqueId, quantidade) {
  const res = await api.post("/produto-estoque").send({
    ProdutoID: produtoId,
    EstoqueID: estoqueId,
    Quantidade: quantidade,
  });

  expect([201]).toContain(res.statusCode);
  expect(res.body).toBeDefined();
  return res.body;
}

describe("Movimentacoes API", () => {
  let api;

  beforeAll(async () => {
    api = await authRequest();
  });

  describe("GET /movimentacoes", () => {
    test("lista vazio quando não tem dados", async () => {
      const res = await api.get("/movimentacoes");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    test("após criar movimentação, GET retorna pelo menos 1", async () => {
      const { produto, estoque, funcionario } = await setupBase(api);
      await vincularProdutoNoEstoque(api, produto.id, estoque.id, 5);

      await criarMovimentacao({
        Tipo: 1,
        Quantidade: 2,
        fk_Produto_ID: produto.id,
        fk_Estoque_ID: estoque.id,
        fk_Funcionario_ID: funcionario.id,
      });

      const res = await api.get("/movimentacoes");
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    test("GET traz campos principais do join", async () => {
      const { produto, estoque, funcionario } = await setupBase(api);
      await vincularProdutoNoEstoque(api, produto.id, estoque.id, 5);

      await criarMovimentacao({
        Tipo: 1,
        Quantidade: 2,
        fk_Produto_ID: produto.id,
        fk_Estoque_ID: estoque.id,
        fk_Funcionario_ID: funcionario.id,
      });

      const res = await api.get("/movimentacoes");
      expect(res.statusCode).toBe(200);

      const row = res.body[0];
      expect(row).toBeDefined();
      expect(row.id).toBeDefined();
      expect(row.quantidade).toBeDefined();
      expect(row.tipo).toBeDefined();
      expect(row.nomeproduto).toBeDefined();
      expect(row.nomeestoque).toBeDefined();
      expect(row.nomefuncionario).toBeDefined();
    });
  });

  describe("POST /movimentacoes", () => {
    test("entrada aumenta quantidade no produto-estoque (quando já vinculado)", async () => {
      const { produto, estoque, funcionario } = await setupBase(api);
      await vincularProdutoNoEstoque(api, produto.id, estoque.id, 5);

      const antes = await obterQuantidadeProdutoNoEstoque(
        produto.id,
        estoque.id,
      );

      const res = await api.post("/movimentacoes").send({
        Data: new Date().toISOString(),
        Quantidade: 3,
        Tipo: 1,
        fk_Produto_ID: produto.id,
        fk_Estoque_ID: estoque.id,
        fk_Funcionario_ID: funcionario.id,
      });

      expect(res.statusCode).toBe(201);

      const depois = await obterQuantidadeProdutoNoEstoque(
        produto.id,
        estoque.id,
      );
      expect(depois).toBe(antes + 3);
    });

    test("entrada cria vínculo automaticamente quando produto não está no estoque", async () => {
      const { produto, estoque, funcionario } = await setupBase(api);

      // não vincula antes
      const res = await api.post("/movimentacoes").send({
        Data: new Date().toISOString(),
        Quantidade: 7,
        Tipo: 1,
        fk_Produto_ID: produto.id,
        fk_Estoque_ID: estoque.id,
        fk_Funcionario_ID: funcionario.id,
      });

      expect(res.statusCode).toBe(201);
      // como o service sempre retorna { success, movimentacao }
      expect(res.body).toBeDefined();

      const qtd = await obterQuantidadeProdutoNoEstoque(produto.id, estoque.id);
      expect(qtd).toBe(7);
    });

    test("saída reduz quantidade no produto-estoque", async () => {
      const { produto, estoque, funcionario } = await setupBase(api);
      await vincularProdutoNoEstoque(api, produto.id, estoque.id, 10);

      const antes = await obterQuantidadeProdutoNoEstoque(
        produto.id,
        estoque.id,
      );

      const res = await api.post("/movimentacoes").send({
        Data: new Date().toISOString(),
        Quantidade: 4,
        Tipo: 2,
        fk_Produto_ID: produto.id,
        fk_Estoque_ID: estoque.id,
        fk_Funcionario_ID: funcionario.id,
      });

      expect(res.statusCode).toBe(201);
      // quando dá certo, o service responde success:true
      expect(res.body.success).toBe(true);

      const depois = await obterQuantidadeProdutoNoEstoque(
        produto.id,
        estoque.id,
      );
      expect(depois).toBe(antes - 4);
    });

    test("saída com quantidade insuficiente deve retornar success:false e NÃO alterar o estoque", async () => {
      const { produto, estoque, funcionario } = await setupBase(api);
      await vincularProdutoNoEstoque(api, produto.id, estoque.id, 2);

      const antes = await obterQuantidadeProdutoNoEstoque(
        produto.id,
        estoque.id,
      );

      const res = await api.post("/movimentacoes").send({
        Data: new Date().toISOString(),
        Quantidade: 999,
        Tipo: 2,
        fk_Produto_ID: produto.id,
        fk_Estoque_ID: estoque.id,
        fk_Funcionario_ID: funcionario.id,
      });

      // Pelo service atual, isso NÃO vira erro: ele retorna {success:false,...} e o controller manda 201
      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Quantidade insuficiente no estoque.");

      const depois = await obterQuantidadeProdutoNoEstoque(
        produto.id,
        estoque.id,
      );
      expect(depois).toBe(antes);
    });

    test("tipo inválido (ex: 3) deve dar 500", async () => {
      const { produto, estoque, funcionario } = await setupBase(api);
      await vincularProdutoNoEstoque(api, produto.id, estoque.id, 5);

      const res = await api.post("/movimentacoes").send({
        Data: new Date().toISOString(),
        Quantidade: 1,
        Tipo: 3,
        fk_Produto_ID: produto.id,
        fk_Estoque_ID: estoque.id,
        fk_Funcionario_ID: funcionario.id,
      });

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBeDefined();
    });

    test("payload incompleto deve dar erro e não alterar produto-estoque", async () => {
      const { produto, estoque, funcionario } = await setupBase(api);
      await vincularProdutoNoEstoque(api, produto.id, estoque.id, 5);

      const antes = await obterQuantidadeProdutoNoEstoque(
        produto.id,
        estoque.id,
      );

      const res = await api.post("/movimentacoes").send({
        Data: new Date().toISOString(),
        Quantidade: 1,
        Tipo: 1,
        fk_Funcionario_ID: funcionario.id,
      });

      expect([400, 500]).toContain(res.statusCode);

      const depois = await obterQuantidadeProdutoNoEstoque(
        produto.id,
        estoque.id,
      );
      expect(depois).toBe(antes);
    });

    test("resposta do POST volta algum identificador da movimentação", async () => {
      const { produto, estoque, funcionario } = await setupBase(api);
      await vincularProdutoNoEstoque(api, produto.id, estoque.id, 5);

      const res = await api.post("/movimentacoes").send({
        Data: new Date().toISOString(),
        Quantidade: 1,
        Tipo: 1,
        fk_Produto_ID: produto.id,
        fk_Estoque_ID: estoque.id,
        fk_Funcionario_ID: funcionario.id,
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();

      const hasAnyId =
        res.body.id ||
        res.body.ID ||
        (res.body.movimentacao &&
          (res.body.movimentacao.id || res.body.movimentacao.ID)) ||
        (res.body.success && res.body.movimentacao && res.body.movimentacao.id);

      expect(hasAnyId).toBeTruthy();
    });
  });
});
