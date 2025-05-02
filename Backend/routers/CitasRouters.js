const express = require("express");
const router = express.Router();
const CitaController = require("../controllers/CitasControllers");
const Seguridad = require("../middleware/Authorization");

router.get("/listarcitas",Seguridad, CitaController.listarCitas);
router.get("/buscarcitas/:id",Seguridad, CitaController.buscarCitas);
router.post("/crearcitas",Seguridad, CitaController.crearCitas);
router.patch("/editarcitas/:id",Seguridad, CitaController.actualizarCitas);
router.delete("/eliminarcitas/:id",Seguridad, CitaController.eliminarCitas);
router.get('/horarios/:fecha',Seguridad, CitaController.obtenerHorariosOcupados);


module.exports = router;
