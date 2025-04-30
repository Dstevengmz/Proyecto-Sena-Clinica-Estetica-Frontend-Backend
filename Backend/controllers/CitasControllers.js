const citasService = require("../services/CitasServices");

class CitasControllers {

  async listarCitas(req, res) {
    const citas = await citasService.listarLasCitas();
    res.json(citas);
  }

  async buscarCitas(req, res) {
    const citas = await citasService.buscarLasCitas(req.params.id);
    citas
      ? res.json(citas)
      : res.status(404).json({ error: "Citas no encontrado" });
  }

  async crearCitas(req, res) {
    try {
      const nuevocitas = await citasService.crearLasCitas(req.body);
      res.status(201).json(nuevocitas);
    } catch (error) {
      console.error("Error al crear Citas:", error);
      res.status(500).json({
        message: "Hubo un error al crear el Citas",error: error.message,});
    }
  }

  async actualizarCitas(req, res) {
    try {
        const { id } = req.params;
        const { usuario_id,enfermedades,alergias,cirugias_previas,condiciones_piel,embarazo_lactancia,medicamentos,consume_tabaco,consume_alcohol,usa_anticonceptivos,detalles_anticonceptivos,diabetes,hipertension,historial_cancer,problemas_coagulacion,epilepsia,otras_condiciones } = req.body;
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }
        let resultado = await citasService.actualizarLasCitas(id, {usuario_id,enfermedades,alergias,cirugias_previas,condiciones_piel,embarazo_lactancia,medicamentos,consume_tabaco,consume_alcohol,usa_anticonceptivos,detalles_anticonceptivos,diabetes,hipertension,historial_cancer,problemas_coagulacion,epilepsia,otras_condiciones});
        if (!resultado[0]) {
            return res.status(404).json({ error: "Citas no encontrado" });
        }
        res.json({ mensaje: "Citas actualizado correctamente" });
    } catch (e) {
        res.status(500).json({ error: "Error en el servidor al actualizar el Citas" });
    }
}

  async eliminarCitas(req, res) {
    await citasService.eliminarLasCitas(req.params.id);
    res.json({ message: "Citas eliminado" });
  }
}

module.exports = new CitasControllers();