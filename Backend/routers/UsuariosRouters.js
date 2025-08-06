const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/UsuariosControllers");
const {authorization,verificarRol} = require("../middleware/Authorization");
const validarUsuario = require("../middleware/Validaciones");
const { verificarIntentos } = require("../middleware/intentosfallidos");

router.get("/perfil", authorization, usuariosController.perfilUsuario);
router.post("/iniciarsesion",verificarIntentos, usuariosController.iniciarSesion);
router.get("/listarusuarios",authorization, usuariosController.listarUsuarios);
router.get("/buscarusuarios/:id", usuariosController.buscarUsuarios);
router.post("/crearusuarios",validarUsuario, usuariosController.crearUsuarios);
router.patch("/editarusuarios/:id",authorization, usuariosController.actualizarUsuario);
router.delete("/eliminarusuarios/:id",authorization, usuariosController.eliminarUsuarios);
router.patch("/editarestadousuario/:id",usuariosController.activacionUsario);
router.get("/notificaciones/:id", authorization, usuariosController.obtenerNotificaciones);
router.get("/notificacionesusuario/:id", authorization, usuariosController.obtenerNotificacionesUsuario);
router.patch("/notificaciones/:id/marcar-leida", authorization, usuariosController.marcarNotificacionComoLeida);
router.patch("/notificaciones/:id/marcar-todas-leidas", authorization, usuariosController.marcarTodasNotificacionesComoLeidas);
router.patch("/notificaciones/:id/archivar-leidas", authorization, usuariosController.archivarNotificacionesLeidas);
router.get("/notificaciones/:id/historial", authorization, usuariosController.obtenerHistorialNotificaciones);

// Rutas específicas para notificaciones de usuarios
router.patch("/notificacionesusuario/:id/marcar-leida", authorization, usuariosController.marcarNotificacionUsuarioComoLeida);
router.patch("/notificacionesusuario/:id/marcar-todas-leidas", authorization, usuariosController.marcarTodasNotificacionesUsuarioComoLeidas);
router.patch("/notificacionesusuario/:id/archivar-leidas", authorization, usuariosController.archivarNotificacionesLeidasUsuario);
router.get("/notificacionesusuario/:id/historial", authorization, usuariosController.obtenerHistorialNotificacionesUsuario);
module.exports = router;