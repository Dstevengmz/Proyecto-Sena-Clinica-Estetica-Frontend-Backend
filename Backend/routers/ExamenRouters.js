const express = require('express');
const router = express.Router();
const ExamenController = require('../controllers/ExamenControllers');
const uploadExamenes = require('../middleware/MulterExamenes');
const { authorization, verificarRol } = require('../middleware/Authorization');

// Subir múltiples archivos (campo 'archivos')
// Ahora permitimos también al usuario (paciente) subir durante registro de cita
router.post('/subir/:id_cita', authorization, verificarRol(['doctor','asistente','usuario']), uploadExamenes.array('archivos', 10), ExamenController.subir);

// Listar por cita (paciente, doctor o asistente pueden ver)
router.get('/cita/:id_cita', authorization, verificarRol(['usuario','doctor','asistente']), ExamenController.listarPorCita);

// Eliminar (doctor o asistente)
router.delete('/:id', authorization, verificarRol(['doctor','asistente']), ExamenController.eliminar);
// Obtener URL firmada (doctor, paciente, asistente)
router.get('/descargar/:id', authorization, verificarRol(['doctor','usuario','asistente']), ExamenController.descargarSeguro);

module.exports = router;
