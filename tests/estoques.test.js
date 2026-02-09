const request = require("supertest");
const app = require("../src/app");

describe("Testes de Estoques", () => {
  test("Deve criar um novo estoque", async () => {
    const novoEstoque = {
      nome: "Estoque Teste",
      descricao: "Descrição do Estoque Teste",
      local: "Galpão 1",
    };

    const res = await request(app).post("/estoque").send(novoEstoque);

    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toBeDefined();
    expect(res.body.nome).toEqual(novoEstoque.nome);
    expect(res.body.descricao).toEqual(novoEstoque.descricao);
    expect(res.body.local).toEqual(novoEstoque.local);
  });

  test("Deve obter todos os estoques", async () => {
    // garante que existe pelo menos 1, sem depender de estado anterior
    await request(app).post("/estoque").send({
      nome: "Estoque Seed",
      descricao: "Seed",
      local: "Seed",
    });

    const res = await request(app).get("/estoque");

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toEqual(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test("Deve atualizar um estoque existente", async () => {
    // cria primeiro
    const criado = await request(app).post("/estoque").send({
      nome: "Estoque Update",
      descricao: "Antes",
      local: "A1",
    });
    const id = criado.body.id;

    const estoqueAtualizado = {
      nome: "Novo Nome do Estoque",
      descricao: "Nova Descrição do Estoque",
      local: "B2",
    };

    const res = await request(app)
      .put(`/estoque/${id}`)
      .send(estoqueAtualizado);

    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(id);
    expect(res.body.nome).toEqual(estoqueAtualizado.nome);
    expect(res.body.descricao).toEqual(estoqueAtualizado.descricao);
    expect(res.body.local).toEqual(estoqueAtualizado.local);
  });

  test("Deve deletar um estoque", async () => {
    // cria primeiro
    const criado = await request(app).post("/estoque").send({
      nome: "Estoque Delete",
      descricao: "Apagar",
      local: "D1",
    });
    const id = criado.body.id;

    const res = await request(app).delete(`/estoque/${id}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.deleted).toEqual(true);
  });
});
