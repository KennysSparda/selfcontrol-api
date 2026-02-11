// tests/movimentacoes.atomicidade.test.js
const { pool } = require("../src/db");

const movimentacoesService = require("../src/services/movimentacoesService");
const movimentacoesModel = require("../src/models/movimentacoesModel");

async function inserirProduto(nome = "Produto Atomic") {
  const res = await pool.query(
    `INSERT INTO Produto (Nome, Valor, Descricao)
     VALUES ($1, $2, $3)
     RETURNING ID`,
    [nome, "10.00", "desc"],
  );
  return Number(res.rows[0].id);
}

async function inserirEstoque(nome = "Estoque Atomic") {
  const res = await pool.query(
    `INSERT INTO Estoque (Nome, Descricao, Local)
     VALUES ($1, $2, $3)
     RETURNING ID`,
    [nome, "desc", "local"],
  );
  return Number(res.rows[0].id);
}

async function inserirFuncionario(
  nome = "Func Atomic",
  usuario = "atomic.func",
) {
  // usa o mesmo bcrypt do app? aqui não precisa, porque não vamos logar.
  // só precisamos do ID pra FK.
  const res = await pool.query(
    `INSERT INTO Funcionario (Nome, Cargo, Usuario, HashSenha, NivelAcesso)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ID`,
    [nome, "cargo", usuario, "hashfake", 1],
  );
  return Number(res.rows[0].id);
}

async function vincularProdutoEstoque(produtoId, estoqueId, quantidade) {
  await pool.query(
    `INSERT INTO ProdutoEstoque (Quantidade, fk_Produto_ID, fk_Estoque_ID)
     VALUES ($1, $2, $3)`,
    [quantidade, produtoId, estoqueId],
  );
}

async function getQtd(produtoId, estoqueId) {
  const res = await pool.query(
    `SELECT Quantidade
     FROM ProdutoEstoque
     WHERE fk_Produto_ID = $1 AND fk_Estoque_ID = $2`,
    [produtoId, estoqueId],
  );
  return res.rows.length ? Number(res.rows[0].quantidade) : 0;
}

async function countMovimentacoes(produtoId, estoqueId) {
  const res = await pool.query(
    `SELECT COUNT(*)::int as total
     FROM Movimentacoes
     WHERE fk_Produto_ID = $1 AND fk_Estoque_ID = $2`,
    [produtoId, estoqueId],
  );
  return Number(res.rows[0].total);
}

describe("Atomicidade - Movimentações", () => {
  test("se falhar ao inserir movimentação, NÃO pode alterar estoque (entrada)", async () => {
    const produtoId = await inserirProduto();
    const estoqueId = await inserirEstoque();
    const funcionarioId = await inserirFuncionario();

    // começa com 5
    await vincularProdutoEstoque(produtoId, estoqueId, 5);
    const antes = await getQtd(produtoId, estoqueId);
    expect(antes).toBe(5);

    const movAntes = await countMovimentacoes(produtoId, estoqueId);
    expect(movAntes).toBe(0);

    // força falha exatamente na etapa "criar movimentação"
    const spy = jest
      .spyOn(movimentacoesModel, "criarMovimentacao")
      .mockRejectedValue(new Error("boom insert movimentacao"));

    await expect(
      movimentacoesService.criarMovimentacao(
        new Date().toISOString(),
        3, // Quantidade
        1, // Tipo entrada
        produtoId,
        funcionarioId,
        estoqueId,
      ),
    ).rejects.toThrow(/Erro ao criar movimentação/i);

    spy.mockRestore();

    // >>> EXPECTATIVA DE PRODUÇÃO REAL (com transação):
    // estoque não pode mudar se movimentação falhou
    const depois = await getQtd(produtoId, estoqueId);
    expect(depois).toBe(antes); // <-- HOJE VAI FALHAR

    // e também não deve existir movimentação persistida
    const movDepois = await countMovimentacoes(produtoId, estoqueId);
    expect(movDepois).toBe(0);
  });

  test("se falhar ao inserir movimentação, NÃO pode alterar estoque (saída)", async () => {
    const produtoId = await inserirProduto("Produto Atomic Saida");
    const estoqueId = await inserirEstoque("Estoque Atomic Saida");
    const funcionarioId = await inserirFuncionario(
      "Func Atomic Saida",
      "atomic2.func",
    );

    // começa com 10
    await vincularProdutoEstoque(produtoId, estoqueId, 10);
    const antes = await getQtd(produtoId, estoqueId);
    expect(antes).toBe(10);

    const movAntes = await countMovimentacoes(produtoId, estoqueId);
    expect(movAntes).toBe(0);

    const spy = jest
      .spyOn(movimentacoesModel, "criarMovimentacao")
      .mockRejectedValue(new Error("boom insert movimentacao"));

    await expect(
      movimentacoesService.criarMovimentacao(
        new Date().toISOString(),
        4, // Quantidade
        2, // Tipo saída
        produtoId,
        funcionarioId,
        estoqueId,
      ),
    ).rejects.toThrow(/Erro ao criar movimentação/i);

    spy.mockRestore();

    // >>> EXPECTATIVA DE PRODUÇÃO REAL:
    // estoque não pode mudar se movimentação falhou
    const depois = await getQtd(produtoId, estoqueId);
    expect(depois).toBe(antes); // <-- HOJE VAI FALHAR

    const movDepois = await countMovimentacoes(produtoId, estoqueId);
    expect(movDepois).toBe(0);
  });
});
