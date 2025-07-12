const express = require("express");
const router = express.Router();
const CitaController = require("../controllers/CitasControllers");
const {authorization,verificarRol} = require("../middleware/Authorization");

router.get("/listarcitas",authorization,verificarRol(["doctor", "asistente"]), CitaController.listarCitas);
router.get("/buscarcitas/:id",authorization, CitaController.buscarCitas);
router.post("/crearcitas",authorization, CitaController.crearCitas);
router.patch("/editarcitas/:id",authorization, CitaController.actualizarCitas);
router.delete("/eliminarcitas/:id",authorization, CitaController.eliminarCitas);
router.get('/horarios/:fecha',authorization, CitaController.obtenerHorariosOcupados);
router.post("/crearordendesdecita", authorization, CitaController.crearOrdenDesdeCarrito);


module.exports = router;
