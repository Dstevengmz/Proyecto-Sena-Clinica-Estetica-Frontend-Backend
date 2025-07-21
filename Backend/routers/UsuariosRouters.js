const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/UsuariosControllers");
const {authorization,verificarRol} = require("../middleware/Authorization");
const validarUsuario = require("../middleware/Validaciones");

router.get("/perfil", authorization, usuariosController.perfilUsuario);
router.post("/iniciarsesion", usuariosController.iniciarSesion);
router.get("/listarusuarios",authorization, usuariosController.listarUsuarios);
router.get("/buscarusuarios/:id", usuariosController.buscarUsuarios);
router.post("/crearusuarios",validarUsuario, usuariosController.crearUsuarios);
router.patch("/editarusuarios/:id",authorization, usuariosController.actualizarUsuario);
router.delete("/eliminarusuarios/:id",authorization, usuariosController.eliminarUsuarios);
router.patch("/editarestadousuario/:id",usuariosController.activacionUsario);
module.exports = router;