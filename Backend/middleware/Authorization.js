const jwt = require("jsonwebtoken");
const { Usuarios } = require("../models");
const authorization = async (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    console.log("Authorization: token no proporcionado ->", req.method, req.originalUrl);
    return res
      .status(401)
      .json({ mensaje: "Acceso denegado, token no proporcionado" });
  }
  try {
    // Acepta "Bearer <token>" con cualquier capitalización y espacios
    const tokenBearer = token.replace(/^Bearer\s+/i, "").trim();
    const respuestaJwT = jwt.verify(tokenBearer, process.env.JWT_SECRET);
    const usuario = await Usuarios.findByPk(respuestaJwT.id);
    if (!usuario) {
      console.log("Authorization: usuario no encontrado para token válido");
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    req.usuario = usuario;
    next();
  } catch (error) {
    console.log("Authorization: token inválido o expirado ->", req.method, req.originalUrl);
    return res.status(401).json({ mensaje: "Token inválido o expirado" });
  }
};

const verificarRol = (rolesPermitidos) => (req, res, next) => {
  if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
    console.log("Usuario no autorizado: no tienes acceso para esta parte", {
      rolActual: req.usuario?.rol,
      rolesPermitidos,
      ruta: req.originalUrl,
      metodo: req.method,
    });
    return res.status(403).json({ mensaje: "Acceso denegado por rol" });
  }
  console.log("Usuario autorizado:", req.usuario?.dataValues || req.usuario);
  next();
};

module.exports = { authorization, verificarRol };
