const historialMedicoService = require("../services/HistorialMedicoServices");

class HistorialMedicoController {

  async listarHistorialMedico(req, res) {
    const historialmedico = await historialMedicoService.listarLosHistorialesClinicos();
    res.json(historialmedico);
  }

  async buscarHistorialMedico(req, res) {
    const historialmedico = await historialMedicoService.buscarLosHistorialesClinicos(req.params.id);
    historialmedico
      ? res.json(historialmedico)
      : res.status(404).json({ error: "historialmedico no encontrado" });
  }

  async buscarHistorialMedicoporUsuario(req, res) {
  const historialmedico = await historialMedicoService.buscarLosHistorialesClinicosPorUsuario(req.params.id);
  historialmedico
    ? res.json(historialmedico)
    : res.status(404).json({ error: "historialmedico no encontrado" });
}


  async crearHistorialMedico(req, res) {
    try {
      const nuevoHistorialmedico = await historialMedicoService.crearLosHistorialesClinicos(req.body);
      res.status(201).json(nuevoHistorialmedico);
    } catch (error) {
      console.error("Error al crear Historialmedico:", error);
      res.status(500).json({
        message: "Hubo un error al crear el Historialmedico",error: error.message,});
    }
  }

  async actualizarHistorialMedico(req, res) {
    try {
        const { id } = req.params;
        const { usuario_id,enfermedades,alergias,cirugias_previas,condiciones_piel,embarazo_lactancia,medicamentos,consume_tabaco,consume_alcohol,usa_anticonceptivos,detalles_anticonceptivos,diabetes,hipertension,historial_cancer,problemas_coagulacion,epilepsia,otras_condiciones } = req.body;
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }
        let resultado = await historialMedicoService.actualizarLosHistorialesClinicos(id, {usuario_id,enfermedades,alergias,cirugias_previas,condiciones_piel,embarazo_lactancia,medicamentos,consume_tabaco,consume_alcohol,usa_anticonceptivos,detalles_anticonceptivos,diabetes,hipertension,historial_cancer,problemas_coagulacion,epilepsia,otras_condiciones});
        if (!resultado[0]) {
            return res.status(404).json({ error: "Historialmedico no encontrado" });
        }
        res.json({ mensaje: "Historialmedico actualizado correctamente" });
    } catch (e) {
        res.status(500).json({ error: "Error en el servidor al actualizar el Historialmedico" });
    }
}

  async eliminarHistorialMedico(req, res) {
    await historialMedicoService.eliminarLosHistorialesClinicos(req.params.id);
    res.json({ message: "Historialmedico eliminado" });
  }
}

module.exports = new HistorialMedicoController();