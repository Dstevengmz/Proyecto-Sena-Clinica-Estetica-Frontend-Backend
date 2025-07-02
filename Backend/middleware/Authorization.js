const jwt = require("jsonwebtoken");
const { Usuarios } = require("../models");
const authorization = async (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res
      .status(401)
      .json({ mensaje: "Acceso denegado, token no proporcionado" });
  } else {
    try {
      const tokenBearer = token.replace("Bearer", "").trim();
      const respuestaJwT = jwt.verify(tokenBearer, process.env.JWT_SECRET);
      const usuario = await Usuarios.findByPk(respuestaJwT.id);
      if (!usuario)
        return res.status(404).json({ mensaje: "Usuario no encontrado" });

      req.usuario = usuario;
      console.log("Usuario autenticado:", req.usuario.dataValues);
      next();
    } catch (error) {
      return res.status(401).json({ mensaje: "Token inválido o expirado" });
    }
  }
};

const verificarRol = (rolesPermitidos) => (req, res, next) => {
  console.log("Usuario no autorizado:", req.usuario);
  if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
    return res.status(403).json({ mensaje: "Acceso denegado por rol" });
  } else {
    console.log("Usuario autorizado:", req.usuario);
  }
  next();
};

module.exports = { authorization, verificarRol };
