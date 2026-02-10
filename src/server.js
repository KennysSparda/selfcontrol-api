// src/server.js
const dotenv = require("dotenv");
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env" });

const app = require("./app");
const { initDatabase } = require("./models/databaseModel");

const port = process.env.PORT || 5000;

let server;

async function startServer(customPort = port) {
  await initDatabase();

  return new Promise((resolve, reject) => {
    server = app.listen(customPort, (err) => {
      if (err) return reject(err);
      console.log(
        `Servidor Express iniciado em http://localhost:${customPort}`,
      );
      resolve(server);
    });
  });
}

function closeServer() {
  return new Promise((resolve, reject) => {
    if (!server) return resolve();
    server.close((err) => {
      if (err) return reject(err);
      server = null;
      resolve();
    });
  });
}

if (
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "staging"
) {
  startServer(port);
}

module.exports = { startServer, closeServer };
