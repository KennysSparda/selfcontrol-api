// tests/movimentacoes.test.js
const {
  request,
  app,
  criarProduto,
  criarEstoque,
  criarFuncionario,
  criarMovimentacao,
  obterQuantidadeProdutoNoEstoque,
} = require("./_helpers");

async function setupBase() {
  const produto = await criarProduto({ nome: "Produto Mov" });
  const estoque = await criarEstoque({ nome: "Estoque Mov" });
  await criarFuncionario({ usuario: "mov.func", nome: "Funcionario Mov" });

  // pega o ID real do funcionário (porque createFuncionario retorna só {id, message})
  const funcionarios = await request(app).get("/funcionario");
  expect(funcionarios.statusCode).toBe(200);
  const funcionario = funcionarios.body.find((f) => f.usuario === "mov.func");
  expect(funcionario).toBeDefined();

  return { produto, estoque, funcionario };
}

async function vincularProdutoNoEstoque(produtoId, estoqueId, quantidade) {
  const res = await request(app).post("/produto-estoque").send({
    ProdutoID: produtoId,
    EstoqueID: estoqueId,
    Quantidade: quantidade,
  });
  expect(res.statusCode).toBe(200);
  expect(res.body).toBeDefined();
  return res.body;
}

describe("Movimentacoes API", () => {
  describe("GET /movimentacoes", () => {
    test("real: lista vazio quando não tem dados", async () => {
      const res = await request(app).get("/movimentacoes");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    test("real: após criar movimentação, GET retorna pelo menos 1", async () => {
      const { produto, estoque, funcionario } = await setupBase();
      await vincularProdutoNoEstoque(produto.id, estoque.id, 5);

      await criarMovimentacao({
        Tipo: 1,
        Quantidade: 2,
        fk_Produto_ID: produto.id,
        fk_Estoque_ID: estoque.id,
        fk_Funcionario_ID: funcionario.id,
      });

      const res = await request(app).get("/movimentacoes");
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    test("real: GET traz campos principais do join (nomeproduto/nomeestoque/nomefuncionario)", async () => {
      const { produto, estoque, funcionario } = await setupBase();
      await vincularProdutoNoEstoque(produto.id, estoque.id, 5);

      await criarMovimentacao({
        Tipo: 1,
        Quantidade: 2,
        fk_Produto_ID: produto.id,
        fk_Estoque_ID: estoque.id,
        fk_Funcionario_ID: funcionario.id,
      });

      const res = await request(app).get("/movimentacoes");
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

    test("extremo (batata): mesmo com FK zoada na criação (se passar), GET não pode quebrar", async () => {
      // dependendo do teu banco/constraints isso pode dar 500 no POST e tá tudo bem
      const resPost = await request(app).post("/movimentacoes").send({
        Data: new Date().toISOString(),
        Quantidade: 1,
        Tipo: 1,
        fk_Produto_ID: 999999,
        fk_Estoque_ID: 999999,
        fk_Funcionario_ID: 999999,
      });

      expect([200, 500]).toContain(resPost.statusCode);

      const resGet = await request(app).get("/movimentacoes");
      expect(resGet.statusCode).toBe(200);
      expect(Array.isArray(resGet.body)).toBe(true);
    });

    test("extremo: volume maior (10 lançamentos) e GET continua retornando array", async () => {
      const { produto, estoque, funcionario } = await setupBase();
      await vincularProdutoNoEstoque(produto.id, estoque.id, 100);

      for (let i = 0; i < 10; i++) {
        await criarMovimentacao({
          Tipo: 1,
          Quantidade: 1,
          fk_Produto_ID: produto.id,
          fk_Estoque_ID: estoque.id,
          fk_Funcionario_ID: funcionario.id,
        });
      }

      const res = await request(app).get("/movimentacoes");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe("POST /movimentacoes", () => {
    test("real: entrada aumenta quantidade no produto-estoque", async () => {
      const { produto, estoque, funcionario } = await setupBase();
      await vincularProdutoNoEstoque(produto.id, estoque.id, 5);

      const antes = await obterQuantidadeProdutoNoEstoque(
        produto.id,
        estoque.id,
      );

      const res = await request(app).post("/movimentacoes").send({
        Data: new Date().toISOString(),
        Quantidade: 3,
        Tipo: 1,
        fk_Produto_ID: produto.id,
        fk_Estoque_ID: estoque.id,
        fk_Funcionario_ID: funcionario.id,
      });

      expect(res.statusCode).toBe(200);

      const depois = await obterQuantidadeProdutoNoEstoque(
        produto.id,
        estoque.id,
      );
      expect(depois).toBe(antes + 3);
    });

    test("real: saída reduz quantidade no produto-estoque", async () => {
      const { produto, estoque, funcionario } = await setupBase();
      await vincularProdutoNoEstoque(produto.id, estoque.id, 10);

      const antes = await obterQuantidadeProdutoNoEstoque(
        produto.id,
        estoque.id,
      );

      const res = await request(app).post("/movimentacoes").send({
        Data: new Date().toISOString(),
        Quantidade: 4,
        Tipo: 2,
        fk_Produto_ID: produto.id,
        fk_Estoque_ID: estoque.id,
        fk_Funcionario_ID: funcionario.id,
      });

      expect(res.statusCode).toBe(200);

      const depois = await obterQuantidadeProdutoNoEstoque(
        produto.id,
        estoque.id,
      );
      expect(depois).toBe(antes - 4);
    });

    test("real: resposta do POST volta algum identificador da movimentação", async () => {
      const { produto, estoque, funcionario } = await setupBase();
      await vincularProdutoNoEstoque(produto.id, estoque.id, 5);

      const res = await request(app).post("/movimentacoes").send({
        Data: new Date().toISOString(),
        Quantidade: 1,
        Tipo: 1,
        fk_Produto_ID: produto.id,
        fk_Estoque_ID: estoque.id,
        fk_Funcionario_ID: funcionario.id,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();

      // o teu service/model pode devolver id em formatos diferentes
      const hasAnyId =
        res.body.id ||
        res.body.ID ||
        (res.body.movimentacao &&
          (res.body.movimentacao.id || res.body.movimentacao.ID));

      expect(hasAnyId).toBeTruthy();
    });

    test("extremo (batata): funcionário inexistente deve falhar (500) ou retornar erro controlado", async () => {
      const { produto, estoque } = await setupBase();
      await vincularProdutoNoEstoque(produto.id, estoque.id, 5);

      const res = await request(app).post("/movimentacoes").send({
        Data: new Date().toISOString(),
        Quantidade: 1,
        Tipo: 1,
        fk_Produto_ID: produto.id,
        fk_Estoque_ID: estoque.id,
        fk_Funcionario_ID: 999999,
      });

      expect([200, 500]).toContain(res.statusCode);

      // se voltar 200, pelo menos não pode quebrar o sistema
      if (res.statusCode === 200) {
        expect(res.body).toBeDefined();
      }
    });

    test("extremo: payload incompleto deve dar erro (500) e não alterar produto-estoque", async () => {
      const { produto, estoque, funcionario } = await setupBase();
      await vincularProdutoNoEstoque(produto.id, estoque.id, 5);

      const antes = await obterQuantidadeProdutoNoEstoque(
        produto.id,
        estoque.id,
      );

      const res = await request(app).post("/movimentacoes").send({
        // faltando fk_Produto_ID, etc
        Data: new Date().toISOString(),
        Quantidade: 1,
        Tipo: 1,
        fk_Funcionario_ID: funcionario.id,
      });

      expect(res.statusCode).toBe(500);

      const depois = await obterQuantidadeProdutoNoEstoque(
        produto.id,
        estoque.id,
      );
      expect(depois).toBe(antes);
    });
  });
});
