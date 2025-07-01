const express = require("express");
const router = express.Router();
const OrdenProcedimientoController = require("../controllers/OrdenProcedimientosControllers");
const {authorization,verificarRol} = require("../middleware/Authorization");

router.get("/listarordenes",authorization, OrdenProcedimientoController.listarOrdenesProcedimientos);
router.get("/buscarordenes/:id",authorization, OrdenProcedimientoController.buscarOrdenesProcedimientos);
router.post("/crearordenes",authorization,OrdenProcedimientoController.crearOrdenesProcedimientos);
router.patch("/editarordenes/:id",authorization, OrdenProcedimientoController.actualizarOrdenesProcedimientos);
router.delete("/eliminarordenes/:id",authorization, OrdenProcedimientoController.eliminaOrdenesProcedimientos);

module.exports = router;
