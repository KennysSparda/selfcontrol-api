// tests/funcionarios.test.js
const { authRequest, request, app } = require("./_helpers");

describe("Testes de Funcionários", () => {
  let api;

  beforeAll(async () => {
    api = await authRequest();
  });

  test("Deve criar um novo funcionário", async () => {
    const novoFuncionario = {
      nome: "Funcionário Teste",
      cargo: "Desenvolvedor",
      usuario: "func.teste",
      senha: "Senha@123",
      nivelacesso: 1,
    };

    const res = await api.post("/funcionario").send(novoFuncionario);

    expect(res.statusCode).toEqual(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.message).toEqual("Funcionário criado com sucesso.");
  });

  test("Deve obter todos os funcionários", async () => {
    // garante pelo menos 1 além do admin seed
    await api.post("/funcionario").send({
      nome: "Funcionário Seed",
      cargo: "Seed",
      usuario: "seed.func",
      senha: "Seed@123",
      nivelacesso: 1,
    });

    const res = await api.get("/funcionario");

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toEqual(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test("Deve atualizar um funcionário existente", async () => {
    const criado = await api.post("/funcionario").send({
      nome: "Funcionário Update",
      cargo: "Antes",
      usuario: "update.func",
      senha: "Update@123",
      nivelacesso: 1,
    });

    expect(criado.statusCode).toEqual(201);
    const id = criado.body.id;

    const funcionarioAtualizado = {
      nome: "Novo Nome do Funcionário",
      cargo: "Analista",
      usuario: "update.func",
      senha: "Update@123",
      nivelacesso: 2,
    };

    const res = await api.put(`/funcionario/${id}`).send(funcionarioAtualizado);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual("Funcionário atualizado com sucesso.");
  });

  test("Deve deletar um funcionário", async () => {
    const criado = await api.post("/funcionario").send({
      nome: "Funcionário Delete",
      cargo: "Apagar",
      usuario: "delete.func",
      senha: "Delete@123",
      nivelacesso: 1,
    });

    expect(criado.statusCode).toEqual(201);
    const id = criado.body.id;

    const res = await api.delete(`/funcionario/${id}`);

    expect(res.statusCode).toEqual(204);
  });

  test("Login deve retornar 401 com credenciais inválidas", async () => {
    const res = await request(app).post("/funcionario/login").send({
      usuario: "nao.existe",
      senha: "errada",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual("Credenciais inválidas.");
  });

  test("Login deve validar credenciais válidas", async () => {
    // cria um funcionário (admin autenticado)
    await api.post("/funcionario").send({
      nome: "Funcionário Login",
      cargo: "Suporte",
      usuario: "login.func",
      senha: "Login@123",
      nivelacesso: 1,
    });

    // login é público (sem token)
    const res = await request(app).post("/funcionario/login").send({
      usuario: "login.func",
      senha: "Login@123",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe("string");

    expect(res.body.funcionario).toBeDefined();
    expect(res.body.funcionario.id).toBeDefined();
    expect(res.body.funcionario.usuario).toEqual("login.func");
    expect(res.body.funcionario.nivelacesso).toEqual(1);
  });

  test("Deve obter um funcionário por ID", async () => {
    const criado = await api.post("/funcionario").send({
      nome: "Funcionário GetById",
      cargo: "QA",
      usuario: "getbyid.func",
      senha: "Get@123",
      nivelacesso: 1,
    });

    expect(criado.statusCode).toEqual(201);
    const id = criado.body.id;

    const res = await api.get(`/funcionario/${id}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeDefined();

    expect(res.body.id).toEqual(id);
    expect(res.body.nome).toEqual("Funcionário GetById");
    expect(res.body.usuario).toEqual("getbyid.func");
    expect(res.body.nivelacesso).toEqual(1);

    // garante que não vazou hash/senha
    expect(res.body.hashsenha).toBeUndefined();
    expect(res.body.senha).toBeUndefined();
  });

  test("Deve retornar 404 ao buscar funcionário inexistente por ID", async () => {
    const res = await api.get("/funcionario/99999999");

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual("Funcionário não encontrado.");
  });

  test("Deve retornar 400 ao buscar funcionário com userId inválido", async () => {
    const res1 = await api.get("/funcionario/abc");
    expect(res1.statusCode).toEqual(400);
    expect(res1.body.message).toEqual("userId inválido.");

    const res2 = await api.get("/funcionario/-1");
    expect(res2.statusCode).toEqual(400);
    expect(res2.body.message).toEqual("userId inválido.");
  });
});
