const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/UsuariosControllers");
const { authorization, verificarRol } = require("../middleware/Authorization");
const {
  validarUsuario,
  validarUsuarioPublico,
} = require("../middleware/Validaciones");
const { verificarIntentos } = require("../middleware/intentosfallidos");

router.get("/perfil", authorization, usuariosController.perfilUsuario);
router.post(
  "/iniciarsesion",
  verificarIntentos,
  usuariosController.iniciarSesion
);
// Permitir que doctores y asistentes puedan listar usuarios
router.get(
  "/listarusuarios",
  authorization,
  verificarRol(["doctor", "asistente"]),
  usuariosController.listarUsuarios
);
router.get("/doctores", authorization, usuariosController.listarDoctores);
router.get("/usuarios", authorization, usuariosController.listarSoloUsuarios);
router.get("/buscarusuarios/:id", usuariosController.buscarUsuarios);
// Flujo de registro con verificación previa
router.post(
  "/preregistro",
  validarUsuarioPublico,
  usuariosController.preRegistro
);
router.post("/preregistro/confirmar", usuariosController.confirmarRegistro);
// Registro público: no requiere token ni rol; el backend forzará rol "usuario"
router.post(
  "/crearusuarios",
  validarUsuarioPublico,
  usuariosController.crearUsuarios
);
router.post(
  "/crearusuariosadmin",
  authorization,
  verificarRol(["doctor"]),
  validarUsuario,
  usuariosController.crearUsuariosAdmin
);
router.patch(
  "/editarusuarios/:id",
  authorization,
  usuariosController.actualizarUsuario
);
router.delete(
  "/eliminarusuarios/:id",
  authorization,
  verificarRol(["doctor"]),
  usuariosController.eliminarUsuarios
);
router.patch("/editarestadousuario/:id", usuariosController.activacionUsario);
router.get(
  "/notificaciones/:id",
  authorization,
  usuariosController.obtenerNotificaciones
);
router.get(
  "/notificacionesusuario/:id",
  authorization,
  usuariosController.obtenerNotificacionesUsuario
);
router.patch(
  "/notificaciones/:id/marcar-leida",
  authorization,
  usuariosController.marcarNotificacionComoLeida
);
router.patch(
  "/notificaciones/:id/marcar-todas-leidas",
  authorization,
  usuariosController.marcarTodasNotificacionesComoLeidas
);
router.patch(
  "/notificaciones/:id/archivar-leidas",
  authorization,
  usuariosController.archivarNotificacionesLeidas
);
router.get(
  "/notificaciones/:id/historial",
  authorization,
  usuariosController.obtenerHistorialNotificaciones
);

router.patch(
  "/notificacionesusuario/:id/marcar-leida",
  authorization,
  usuariosController.marcarNotificacionUsuarioComoLeida
);
router.patch(
  "/notificacionesusuario/:id/marcar-todas-leidas",
  authorization,
  usuariosController.marcarTodasNotificacionesUsuarioComoLeidas
);
router.patch(
  "/notificacionesusuario/:id/archivar-leidas",
  authorization,
  usuariosController.archivarNotificacionesLeidasUsuario
);
router.get(
  "/notificacionesusuario/:id/historial",
  authorization,
  usuariosController.obtenerHistorialNotificacionesUsuario
);
module.exports = router;
