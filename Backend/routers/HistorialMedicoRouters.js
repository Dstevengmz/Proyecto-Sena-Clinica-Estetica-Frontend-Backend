const express = require("express");
const router = express.Router();
const historialMedicoController = require("../controllers/HistorialMedicoControllers");
const {authorization,verificarRol} = require("../middleware/Authorization");

router.get("/listarhistorialclinico",authorization,historialMedicoController.listarHistorialMedico);
router.get("/buscarhistorialclinico/:id",authorization, historialMedicoController.buscarHistorialMedico);
router.get("/buscarhistorialclinicoporusuario/:id",authorization, historialMedicoController.buscarHistorialMedicoporUsuario);
router.get("/mihistorialclinico/:id",authorization, historialMedicoController.miHistorialMedico);
router.post("/crearhistorialclinico",authorization, historialMedicoController.crearHistorialMedico);
router.patch("/editarhistorialclinico/:id",authorization, historialMedicoController.actualizarHistorialMedico);
router.delete("/eliminarhistorialclinico/:id",authorization, historialMedicoController.eliminarHistorialMedico);

module.exports = router;