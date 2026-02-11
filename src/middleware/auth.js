// src/middleware/auth.js
const jwt = require("jsonwebtoken");

function authenticate(required = true) {
  return (req, res, next) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "JWT_SECRET não configurado" });
    }

    try {
      const header = req.headers.authorization || "";
      const token = header.startsWith("Bearer ")
        ? header.slice(7).trim()
        : null;

      if (!token) {
        if (required) return res.status(401).json({ message: "Token ausente" });
        req.user = null;
        return next();
      }

      const decoded = jwt.verify(token, secret);

      const id = decoded.sub ? Number(decoded.sub) : null;
      const nivelacesso =
        decoded.nivelacesso != null ? Number(decoded.nivelacesso) : null;

      if (!id) {
        return res.status(401).json({ message: "Token inválido" });
      }

      req.user = { id, nivelacesso };
      return next();
    } catch (e) {
      return res.status(401).json({ message: "Token inválido ou expirado" });
    }
  };
}

module.exports = authenticate;
