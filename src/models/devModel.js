const { pool } = require("../db");

const dotenv = require("dotenv");

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// Consulta para execução única das alterações no banco de dados
const executeQueries = async () => {
  try {
    // Exclui a tabela Credenciais
    await pool.query("");

    console.log("Alterações no banco de dados executadas com sucesso.");
  } catch (error) {
    console.error("Erro ao executar as alterações no banco de dados:", error);
  } finally {
    pool.end();
  }
};

// Executa as queries
executeQueries();
