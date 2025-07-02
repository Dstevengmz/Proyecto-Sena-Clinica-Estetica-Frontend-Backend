const express = require("express");
const router = express.Router();
const OrdenesController = require("../controllers/OrdenControllers");
const {authorization,verificarRol} = require("../middleware/Authorization");

router.get("/misordenes", authorization, OrdenesController.listarMisOrdenes);
router.get("/listarordenes",authorization, OrdenesController.listarOrdenes);
router.get("/buscarordenes/:id",authorization, OrdenesController.buscarOrdenes);
router.post("/crearordenes",authorization,OrdenesController.crearOrdenes);
router.patch("/editarordenes/:id",authorization, OrdenesController.actualizarOrdenes);
router.delete("/eliminarordenes/:id",authorization, OrdenesController.eliminarOrdenes);

module.exports = router;
