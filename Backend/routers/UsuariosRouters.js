const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/UsuariosControllers");
const verificarToken = require("../middleware/Authorization");

router.get("/perfil", verificarToken, usuariosController.perfilUsuario);
router.post("/iniciarsesion", usuariosController.iniciarSesion);
router.get("/listarusuarios", usuariosController.listarUsuarios);
router.get("/buscarusuarios/:id", usuariosController.buscarUsuarios);
router.post("/crearusuarios", usuariosController.crearUsuarios);
router.patch("/editarusuarios/:id", usuariosController.actualizarUsuario);
router.delete("/eliminarusuarios/:id", usuariosController.eliminarUsuarios);

module.exports = router;