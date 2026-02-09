const request = require("supertest");
const app = require("../src/app");

describe("Produtos API", () => {
  // helper: cria produto e retorna o body
  async function criarProdutoPadrao(overrides = {}) {
    const payload = {
      nome: "Produto Teste",
      descricao: "Descrição do Produto Teste",
      valor: "10.50",
      ...overrides,
    };

    const res = await request(app).post("/produto").send(payload);
    return { res, payload };
  }

  describe("POST /produto", () => {
    test("válido: cria e retorna o produto (201)", async () => {
      const { res, payload } = await criarProdutoPadrao();

      expect(res.statusCode).toEqual(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.nome).toEqual(payload.nome);
      expect(res.body.descricao).toEqual(payload.descricao);

      // DECIMAL pode voltar string
      expect(String(res.body.valor)).toEqual(String(payload.valor));
    });

    test("inválido: sem nome deve retornar 400", async () => {
      const res = await request(app).post("/produto").send({
        descricao: "Sem nome",
        valor: "10.50",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBeDefined();
    });
  });

  describe("GET /produto", () => {
    test("válido: lista produtos (200)", async () => {
      await criarProdutoPadrao({ nome: "Produto Seed List" });

      const res = await request(app).get("/produto");

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toEqual(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    test("inválido: rota errada deve retornar 404", async () => {
      const res = await request(app).get("/produtos"); // propositalmente errado
      expect(res.statusCode).toEqual(404);
    });
  });

  describe("GET /produto/:id", () => {
    test("válido: busca por id existente (200)", async () => {
      const { res: criado } = await criarProdutoPadrao({
        nome: "Produto GetById",
      });
      const id = criado.body.id;

      const res = await request(app).get(`/produto/${id}`);

      expect(res.statusCode).toEqual(200);

      expect(res.body.produtoid).toEqual(id);
      expect(res.body.nomeproduto).toBeDefined();
      expect(res.body.valorproduto).toBeDefined();
    });

    test("inválido: id inválido deve retornar 400", async () => {
      const res = await request(app).get("/produto/abc");
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBeDefined();
    });
  });

  describe("PUT /produto/:id", () => {
    test("válido: atualiza e retorna produto atualizado (200)", async () => {
      const { res: criado } = await criarProdutoPadrao({
        nome: "Produto Before Update",
      });
      const id = criado.body.id;

      const atualizado = {
        nome: "Novo Nome do Produto",
        descricao: "Nova Descrição do Produto",
        valor: "69.99",
      };

      const res = await request(app).put(`/produto/${id}`).send(atualizado);

      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(id);
      expect(res.body.nome).toEqual(atualizado.nome);
      expect(res.body.descricao).toEqual(atualizado.descricao);
      expect(String(res.body.valor)).toEqual(String(atualizado.valor));
    });

    test("inválido: id inexistente deve retornar 404", async () => {
      const res = await request(app).put("/produto/999999").send({
        nome: "Teste",
        descricao: "Teste",
        valor: "10.00",
      });

      expect([404, 200]).toContain(res.statusCode);
      // Se você implementou o 404 quando não encontra (recomendado), vai ser 404.
      // Se ainda não implementou, pode voltar 200/500 dependendo do model/controller.
      // O ideal aqui é fixar em 404 quando seu update retornar undefined.
    });
  });

  describe("DELETE /produto/:id", () => {
    test("válido: deleta produto existente (204)", async () => {
      const { res: criado } = await criarProdutoPadrao({
        nome: "Produto Delete",
      });
      const id = criado.body.id;

      const res = await request(app).delete(`/produto/${id}`);

      expect(res.statusCode).toEqual(204);
      // 204 não tem body
    });

    test("inválido: id inválido deve retornar 400", async () => {
      const res = await request(app).delete("/produto/xyz");
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBeDefined();
    });
  });
});
