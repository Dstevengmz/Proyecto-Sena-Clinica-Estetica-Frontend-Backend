const express = require("express");
const router = express.Router();
const CarritoController = require("../controllers/CarritoControllers");
const { authorization } = require("../middleware/Authorization");

router.get("/listarmicarrito", authorization, CarritoController.listarMiCarrito);
router.post("/agregaramicarrito", authorization, CarritoController.agregarAlCarrito);
router.delete("/eliminardemicarrito/:id", authorization, CarritoController.eliminarDelCarrito);
router.delete("/limpiarmicarrito", authorization, CarritoController.limpiarMiCarrito);

module.exports = router;
