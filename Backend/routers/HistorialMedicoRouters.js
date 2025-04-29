const express = require("express");
const router = express.Router();
const historialMedicoController = require("../controllers/HistorialMedicoControllers");
const Seguridad = require("../middleware/Authorization");

router.get("/listarhistorialclinico", historialMedicoController.listarHistorialMedico);
router.get("/buscarhistorialclinico/:id",Seguridad, historialMedicoController.buscarHistorialMedico);
router.post("/crearhistorialclinico",Seguridad, historialMedicoController.crearHistorialMedico);
router.patch("/editarhistorialclinico/:id",Seguridad, historialMedicoController.actualizarHistorialMedico);
router.delete("/eliminarhistorialclinico/:id",Seguridad, historialMedicoController.eliminarHistorialMedico);

module.exports = router;