const jwt = require("jsonwebtoken");

const authorization = async (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.json({ mensaje: "Acceso denegado, token no proporcionado" });
  } else {
    try {
      const tokenBearer = token.replace("Bearer", "").trim();
      const respuestaJwT = await jwt.verify(tokenBearer, process.env.JWT_SECRET);
      req.usuario = respuestaJwT;
      next();
    } catch (error) {
      return res.json({ mensaje: "Token inválido" });
    }
  }
};

const verificarRol = (rolesPermitidos) => (req, res, next) => {
  console.log("Usuario no autorizado:", req.usuario);
  if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
    return res.status(403).json({ mensaje: "Acceso denegado por rol" });
  }else{
    console.log("Usuario autorizado:", req.usuario);
  }
  next();
};

module.exports = {authorization,verificarRol,};