const jwt = require("jsonwebtoken");
const { usuarios, historialclinico } = require("../models");
const authorization = async (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    console.log(
      "Authorization: token no proporcionado ->",
      req.method,
      req.originalUrl
    );
    return res
      .status(401)
      .json({ mensaje: "Acceso denegado, token no proporcionado" });
  }
  try {
    const tokenBearer = token.replace(/^Bearer\s+/i, "").trim();
    const respuestaJwT = jwt.verify(tokenBearer, process.env.JWT_SECRET);
    const usuario = await usuarios.findByPk(respuestaJwT.id);
    if (!usuario) {
      console.log("Authorization: usuario no encontrado para token válido");
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    req.usuario = usuario;
    next();
  } catch (error) {
    console.log(
      "Authorization: token inválido o expirado ->",
      req.method,
      req.originalUrl
    );
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

// Permitir acceso si es doctor o dueño del historial por :id (id del historial)
// Permitir acceso si es doctor o propietario del historial (por :id de historial)
const permitirDoctorOPropietarioPorIdHistorial = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ mensaje: "ID de historial inválido" });
    }
    const record = await historialclinico.findByPk(id);
    if (!record) {
      return res.status(404).json({ mensaje: "Historial médico no encontrado" });
    }
    const esDoctor = req.usuario?.rol === "doctor";
    const idPropietario = record.id_usuario ?? record.usuario_id;
    const esPropietario = Number(req.usuario?.id) === Number(idPropietario);
    if (!esDoctor && !esPropietario) {
      return res.status(403).json({ mensaje: "Acceso denegado por pertenencia" });
    }
    next();
  } catch (e) {
    console.error("Error en permitirDoctorOPropietarioPorIdHistorial:", e);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const permitirDoctorOPropietarioPorIdUsuario = (req, res, next) => {
  const { id } = req.params;
  const esDoctor = req.usuario?.rol === "doctor";
  const esPropietario = Number(req.usuario?.id) === Number(id);
  if (!esDoctor && !esPropietario) {
    return res.status(403).json({ mensaje: "Acceso denegado por rol/pertenencia" });
  }
  next();
};

module.exports.permitirDoctorOPropietarioPorIdHistorial = permitirDoctorOPropietarioPorIdHistorial;
module.exports.permitirDoctorOPropietarioPorIdUsuario = permitirDoctorOPropietarioPorIdUsuario;
