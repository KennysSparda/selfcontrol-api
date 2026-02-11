const { authRequest } = require("./_helpers");

describe("ProdutoEstoque API", () => {
  let api;

  beforeAll(async () => {
    api = await authRequest();
  });

  async function criarProduto(overrides = {}) {
    const payload = {
      nome: "Produto PE",
      descricao: "Produto para ProdutoEstoque",
      valor: "10.00",
      ...overrides,
    };

    const res = await api.post("/produto").send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();

    return res.body;
  }

  async function criarEstoque(overrides = {}) {
    const payload = {
      nome: "Estoque PE",
      descricao: "Estoque para ProdutoEstoque",
      local: "Local PE",
      ...overrides,
    };

    const res = await api.post("/estoque").send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();

    return res.body;
  }

  test("GET /produto-estoque: deve listar vazio (array)", async () => {
    const res = await api.get("/produto-estoque");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test("POST /produto-estoque: deve vincular produto ao estoque", async () => {
    const produto = await criarProduto({ nome: "Produto Vinculo" });
    const estoque = await criarEstoque({ nome: "Estoque Vinculo" });

    const payload = {
      ProdutoID: produto.id,
      EstoqueID: estoque.id,
      Quantidade: 5,
    };

    const res = await api.post("/produto-estoque").send(payload);

    expect(res.statusCode).toBe(201);

    expect(res.body.produtoestoqueid).toBeDefined();
    expect(res.body.produtoid).toBe(produto.id);
    expect(res.body.estoqueid).toBe(estoque.id);
    expect(res.body.quantidade).toBe(5);
  });

  test("GET /produto-estoque: deve listar pelo menos 1 após vincular", async () => {
    const produto = await criarProduto({ nome: "Produto List" });
    const estoque = await criarEstoque({ nome: "Estoque List" });

    await api.post("/produto-estoque").send({
      ProdutoID: produto.id,
      EstoqueID: estoque.id,
      Quantidade: 3,
    });

    const res = await api.get("/produto-estoque");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);

    // valida campos mais comuns do SELECT join
    const item = res.body[0];
    expect(item.produtoestoqueid).toBeDefined();
    expect(item.produtoid).toBeDefined();
    expect(item.estoqueid).toBeDefined();
    expect(item.quantidade).toBeDefined();
    expect(item.nomeproduto).toBeDefined();
    expect(item.nomeestoque).toBeDefined();
  });

  test("GET /produto-estoque/:estoqueId: deve listar produtos do estoque específico", async () => {
    const produto1 = await criarProduto({ nome: "Produto A" });
    const produto2 = await criarProduto({ nome: "Produto B" });

    const estoque1 = await criarEstoque({ nome: "Estoque 1" });
    const estoque2 = await criarEstoque({ nome: "Estoque 2" });

    // vincula 2 produtos no estoque1
    await api.post("/produto-estoque").send({
      ProdutoID: produto1.id,
      EstoqueID: estoque1.id,
      Quantidade: 2,
    });

    await api.post("/produto-estoque").send({
      ProdutoID: produto2.id,
      EstoqueID: estoque1.id,
      Quantidade: 4,
    });

    // vincula 1 produto no estoque2
    await api.post("/produto-estoque").send({
      ProdutoID: produto1.id,
      EstoqueID: estoque2.id,
      Quantidade: 1,
    });

    const res = await api.get(`/produto-estoque/${estoque1.id}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // deve vir só itens do estoque1
    res.body.forEach((row) => {
      expect(row.estoqueid).toBe(estoque1.id);
      expect(row.produtoid).toBeDefined();
      expect(row.quantidade).toBeDefined();
      expect(row.nomeproduto).toBeDefined();
    });

    expect(res.body.length).toBe(2);
  });

  test("DELETE /produto-estoque/:id: deve remover vínculo e confirmar que saiu", async () => {
    const produto = await criarProduto({ nome: "Produto Delete Vinculo" });
    const estoque = await criarEstoque({ nome: "Estoque Delete Vinculo" });

    const vinculo = await api.post("/produto-estoque").send({
      ProdutoID: produto.id,
      EstoqueID: estoque.id,
      Quantidade: 7,
    });

    const produtoEstoqueId = vinculo.body.produtoestoqueid;

    expect(produtoEstoqueId).toBeDefined();

    const del = await api.delete(`/produto-estoque/${produtoEstoqueId}`);
    expect(del.statusCode).toBe(204);

    // garante que não aparece mais no GET por estoque
    const res = await api.get(`/produto-estoque/${estoque.id}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});
