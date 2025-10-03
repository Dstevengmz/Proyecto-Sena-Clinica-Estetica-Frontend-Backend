const express = require("express");
const router = express.Router();
const historialMedicoController = require("../controllers/HistorialMedicoControllers");
const {
  authorization,
  verificarRol,
  permitirDoctorOPropietarioPorIdHistorial,
  permitirDoctorOPropietarioPorIdUsuario,
} = require("../middleware/Authorization");

router.get(
  "/listarhistorialclinico",
  authorization,
  verificarRol(["doctor", "asistente"]),
  historialMedicoController.listarHistorialMedico
);
router.get(
  "/buscarhistorialclinico/:id",
  authorization,
  permitirDoctorOPropietarioPorIdHistorial,
  historialMedicoController.buscarHistorialMedico
);
router.get(
  "/buscarhistorialclinicoporusuario/:id",
  authorization,
  permitirDoctorOPropietarioPorIdUsuario,
  historialMedicoController.buscarHistorialMedicoporUsuario
);
router.get(
  "/mihistorialclinico/:id",
  authorization,
  permitirDoctorOPropietarioPorIdUsuario,
  historialMedicoController.miHistorialMedico
);
router.post(
  "/crearhistorialclinico",
  authorization,
  historialMedicoController.crearHistorialMedico
);
router.patch(
  "/editarhistorialclinico/:id",
  authorization,
  permitirDoctorOPropietarioPorIdHistorial,
  historialMedicoController.actualizarHistorialMedico
);
router.delete(
  "/eliminarhistorialclinico/:id",
  authorization,
  verificarRol(["doctor", "asistente"]),
  historialMedicoController.eliminarHistorialMedico
);

module.exports = router;
