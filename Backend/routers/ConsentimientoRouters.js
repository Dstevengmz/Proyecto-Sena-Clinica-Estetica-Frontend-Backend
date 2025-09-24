const express = require("express");
const router = express.Router();
const ConsentimientoController = require("../controllers/ConsentimientoControllers");
const { authorization, verificarRol } = require("../middleware/Authorization");

router.get(
  "/usuario",
  authorization,
  verificarRol(["usuario", "doctor", "asistente"]),
  ConsentimientoController.obtenerConsentimientosPorUsuario
);

router.get(
  "/cita/:id_cita",
  authorization,
  verificarRol(["usuario", "doctor", "asistente"]),
  ConsentimientoController.obtenerConsentimientosPorCita
);

router.get(
  "/:id/pdf",
  authorization,
  verificarRol(["doctor", "asistente"]),
  ConsentimientoController.descargarConsentimiento
);

router.post(
  "/",
  authorization,
  verificarRol(["usuario"]),
  ConsentimientoController.agregarConsentimiento
);

router.delete(
  "/eliminar/:id",
  authorization,
  verificarRol(["usuario", "doctor", "asistente"]),
  ConsentimientoController.eliminarConsentimiento
);

router.delete(
  "/limpiar",
  authorization,
  verificarRol(["usuario"]),
  ConsentimientoController.limpiarConsentimientos
);

module.exports = router;
