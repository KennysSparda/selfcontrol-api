// src/middleware/requireAdmin.js
function requireAdmin(req, res, next) {
  if (!req.user || req.user.nivelacesso == null) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  if (req.user.nivelacesso !== 2) {
    return res.status(403).json({ message: "Acesso negado" });
  }

  return next();
}

module.exports = requireAdmin;
