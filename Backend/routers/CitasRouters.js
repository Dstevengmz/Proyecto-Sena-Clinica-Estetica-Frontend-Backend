const express = require("express");
const router = express.Router();
const CitaController = require("../controllers/CitasControllers");
const {authorization,verificarRol} = require("../middleware/Authorization");

router.get("/listarcitas",authorization,verificarRol(["doctor", "asistente"]), CitaController.listarCitas);
router.get("/buscarcitas/:id",authorization, CitaController.buscarCitas);
router.post("/crearcitas",authorization, CitaController.crearCitas);
router.patch("/editarcitas/:id",authorization,verificarRol(["doctor", "asistente"]), CitaController.actualizarCitas);
router.delete("/eliminarcitas/:id",authorization, CitaController.eliminarCitas);
router.get('/horarios/:fecha',authorization, CitaController.obtenerHorariosOcupados);
router.post("/crearordendesdecita", authorization, CitaController.crearOrdenDesdeCarrito);
// Ruta para consultar citas por dia doctor
router.get('/citas/dia/:doctorId', CitaController.citasPorDia);
// Ruta para consultar citas por rango de fechas
router.get("/citas/rango/:doctorId", CitaController.citasPorRango);
// Ruta para consultar citas por tipo
router.get("/citas/tipo/:doctorId", CitaController.citasPorTipo);
router.get("/miscitas", authorization, verificarRol(["usuario", "doctor", "asistente"]), CitaController.misCitas);
router.patch("/editarestadocita/:id",authorization,verificarRol(["doctor"]),CitaController.actualizarEstadoCita
);
// Descargar PDF de exámenes requeridos
router.get('/orden-examenes/pdf/:id', authorization, verificarRol(["usuario","doctor","asistente"]), CitaController.generarPDFExamenes);


module.exports = router;
