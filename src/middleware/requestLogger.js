const fs = require("fs");
const path = require("path");

const LOG_PATH = path.join(__dirname, "..", "logs", "requests.log");
fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });

const stream = fs.createWriteStream(LOG_PATH, { flags: "a" });

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const ms = Date.now() - start;

    const ip =
      (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
      req.socket.remoteAddress;

    const line =
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} ` +
      `(${ms}ms) ip=${ip} ua="${req.headers["user-agent"]}"\n`;

    process.stdout.write(line);
    stream.write(line);
  });

  next();
}

module.exports = requestLogger;
