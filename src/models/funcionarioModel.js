// models/Funcionario.js

const { pool } = require("../db");

const bcrypt = require("bcrypt");

async function obterFuncionarios() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT ID, Nome, Cargo, Usuario, NivelAcesso FROM Funcionario",
    );
    client.release();
    return result.rows;
  } catch (error) {
    throw error;
  }
}

async function createFuncionario(funcionarioData) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const hashedPassword = await bcrypt.hash(funcionarioData.senha, 10);
    const funcionarioQuery = `
            INSERT INTO Funcionario (Nome, Cargo, Usuario, HashSenha, NivelAcesso)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING ID;
        `;
    const funcionarioValues = [
      funcionarioData.nome,
      funcionarioData.cargo,
      funcionarioData.usuario,
      hashedPassword,
      funcionarioData.nivelacesso,
    ];
    const funcionarioResult = await client.query(
      funcionarioQuery,
      funcionarioValues,
    );
    const funcionarioID = funcionarioResult.rows[0].id;

    await client.query("COMMIT");
    return funcionarioID;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function updateFuncionario(funcionarioID, funcionarioData) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (funcionarioData.senha) {
      const hashedPassword = await bcrypt.hash(funcionarioData.senha, 10);
      const updateFuncionarioQuery = `
                UPDATE Funcionario
                SET Nome = $1, Cargo = $2, Usuario = $3, HashSenha = $4, NivelAcesso = $5
                WHERE ID = $6;
            `;
      const updateFuncionarioValues = [
        funcionarioData.nome,
        funcionarioData.cargo,
        funcionarioData.usuario,
        hashedPassword,
        funcionarioData.nivelacesso,
        funcionarioID,
      ];
      await client.query(updateFuncionarioQuery, updateFuncionarioValues);
    } else {
      const updateFuncionarioQuery = `
                UPDATE Funcionario
                SET Nome = $1, Cargo = $2, Usuario = $3, NivelAcesso = $4
                WHERE ID = $5;
            `;
      const updateFuncionarioValues = [
        funcionarioData.nome,
        funcionarioData.cargo,
        funcionarioData.usuario,
        funcionarioData.nivelacesso || 1,
        funcionarioID,
      ];
      await client.query(updateFuncionarioQuery, updateFuncionarioValues);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function deleteFuncionario(funcionarioID) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const deleteFuncionarioQuery = `
            DELETE FROM Funcionario
            WHERE ID = $1;
        `;
    await client.query(deleteFuncionarioQuery, [funcionarioID]);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function validarCredenciais(usuario, senha) {
  const client = await pool.connect();
  try {
    const query = `
      SELECT ID, Nome, Usuario, HashSenha, NivelAcesso
      FROM Funcionario
      WHERE Usuario = $1;
    `;
    const result = await client.query(query, [usuario]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const match = await bcrypt.compare(senha, row.hashsenha);

    if (!match) {
      return null;
    }

    return {
      id: row.id,
      nome: row.nome,
      usuario: row.usuario,
      nivelacesso: row.nivelacesso,
    };
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  obterFuncionarios,
  createFuncionario,
  updateFuncionario,
  deleteFuncionario,
  validarCredenciais,
};
