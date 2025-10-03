const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/CambiarContrasena.Controllers");
const { authorization, verificarRol } = require("../middleware/Authorization");

router.post("/cambiarcontrasena", authorization, usuarioController.cambiarcontrasena);
router.post("/olvidocontrasena", usuarioController.solicitarReset);
router.post("/resetearcontrasena/:token", usuarioController.resetearPassword);

module.exports = router;
