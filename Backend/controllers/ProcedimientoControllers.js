const procedimientosServices = require("../services/ProcedimientosServices");

class ProcedimientosController {

  async listarProcedimientos(req, res) {
    const procedimiento = await procedimientosServices.listarLosProcedimientos();
    res.json(procedimiento);
  }

  async buscarProcedimientos(req, res) {
    const procedimiento = await procedimientosServices.buscarLosProcedimientos(req.params.id);
    procedimiento
      ? res.json(procedimiento)
      : res.status(404).json({ error: "Procedimiento no encontrado" });
  }

async crearProcedimientos(req, res) {
  try {
    const datos = req.body;
    datos.requiere_evaluacion = datos.requiere_evaluacion === "true";
    datos.precio = parseFloat(datos.precio);
    datos.duracion = parseInt(datos.duracion);

    if (req.file) {
      datos.imagen = req.file.path;
    }
    const nuevoProcedimiento = await procedimientosServices.crearLosProcedimientos(datos);
    res.status(201).json(nuevoProcedimiento);
  } catch (error) {
    console.error("Error al crear Procedimiento:", error);
    res.status(500).json({
      message: "Hubo un error al crear el Procedimiento",
      error: error.message,
    });
  }
}

  async actualizarProcedimientos(req, res) {
    try {
        const { id } = req.params;
        const { nombre,descripcion,precio,requiere_evaluacion,duracion,examenes_requeridos,imagen,categoria,recomendaciones_previas } = req.body;
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }
        let resultado = await procedimientosServices.actualizarLosProcedimientos(id, {nombre,descripcion,precio,requiere_evaluacion,duracion,examenes_requeridos,imagen,categoria,recomendaciones_previas });

        if (!resultado[0]) {
            return res.status(404).json({ error: "Procedimiento no encontrado" });
        }

        res.json({ mensaje: "Procedimiento actualizado correctamente" });
    } catch (e) {
        res.status(500).json({ error: "Error en el servidor al actualizar el Procedimiento" });
    }
}

  async eliminarProcedimientos(req, res) {
    await procedimientosServices.eliminarLosProcedimientos(req.params.id);
    res.json({ message: "Procedimiento eliminado" });
  }

}

module.exports = new ProcedimientosController();