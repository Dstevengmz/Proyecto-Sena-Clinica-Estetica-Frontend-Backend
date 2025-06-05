const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/UsuariosControllers");
const {authorization,verificarRol} = require("../middleware/Authorization");
const validarUsuario = require("../middleware/Validaciones");

router.get("/perfil", authorization, usuariosController.perfilUsuario);
router.post("/iniciarsesion", usuariosController.iniciarSesion);
router.get("/listarusuarios", usuariosController.listarUsuarios);
router.get("/buscarusuarios/:id", usuariosController.buscarUsuarios);
router.post("/crearusuarios",validarUsuario, usuariosController.crearUsuarios);
router.patch("/editarusuarios/:id", usuariosController.actualizarUsuario);
router.delete("/eliminarusuarios/:id", usuariosController.eliminarUsuarios);

module.exports = router;