const express = require("express");
const router = express.Router();
const CitaController = require("../controllers/CitasControllers");
const {authorization,verificarRol} = require("../middleware/Authorization");

router.get("/listarcitas",authorization,verificarRol(["doctor", "asistente","usuario"]), CitaController.listarCitas);
router.get("/buscarcitas/:id",authorization, CitaController.buscarCitas);
router.post("/crearcitas",authorization, CitaController.crearCitas);



router.patch( "/editarcita-doctor/:id", authorization, verificarRol(["doctor", "asistente"]), CitaController.actualizarCitaDoctor
);

router.patch( "/editarcitausuario/:id", authorization, verificarRol(["usuario"]), CitaController.actualizarCitaUsuario
);

router.patch( "/cancelarcita/:id", authorization, verificarRol(["usuario"]), CitaController.cancelarCita
);


router.get("/pacientesdoctor", authorization, verificarRol(["doctor"]), CitaController.listarPacientesPorDoctor
);

router.get("/citasusuario/:usuarioId", authorization, verificarRol(["doctor"]), CitaController.listarCitasPorUsuarioYDoctor
);






router.delete("/eliminarcitas/:id",authorization, CitaController.eliminarCitas);
router.get('/horarios/:fecha',authorization, CitaController.obtenerHorariosOcupados);
router.post("/crearordendesdecita", authorization, CitaController.crearOrdenDesdeCarrito);
router.get('/citas/dia/:doctorId', CitaController.citasPorDia);
router.get("/citas/rango/:doctorId", CitaController.citasPorRango);
router.get("/citas/tipo/:doctorId", CitaController.citasPorTipo);
router.get("/miscitas", authorization, verificarRol(["usuario", "doctor", "asistente"]), CitaController.misCitas);
router.patch("/editarestadocita/:id",authorization,verificarRol(["doctor"]),CitaController.actualizarEstadoCita);
router.get('/orden-examenes/pdf/:id', authorization, verificarRol(["usuario","doctor","asistente"]), CitaController.generarPDFExamenes);
router.patch('/marcar-examenes-subidos/:id', authorization, verificarRol(["usuario"]), CitaController.marcarExamenesSubidos);


module.exports = router;
