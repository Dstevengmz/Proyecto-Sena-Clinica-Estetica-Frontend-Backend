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
        message: "Hubo un error al crear el Citas",
        error: error.message,
      });
    }
  }

  async actualizarCitas(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario, id_doctor, fecha, estado, tipo, observaciones } =
        req.body;
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      let resultado = await citasService.actualizarLasCitas(id, {
        id_usuario,
        id_doctor,
        fecha,
        estado,
        tipo,
        observaciones,
      });
      if (!resultado[0]) {
        return res.status(404).json({ error: "Citas no encontrado" });
      }
      res.json({ mensaje: "Citas actualizado correctamente" });
    } catch (e) {
      res
        .status(500)
        .json({ error: "Error en el servidor al actualizar el Citas" });
    }
  }
  async crearOrdenDesdeCarrito(req, res) {
    try {
      const id_usuario = req.usuario.id;
      const ordenCreada = await citasService.crearOrdenDesdeCarrito(id_usuario);
      res.status(201).json({
        mensaje: "Orden creada exitosamente.",
        orden: ordenCreada,
      });
      console.log("Orden creada desde el carrito:", ordenCreada);
    } catch (e) {
      console.log("Error en crearOrdenDesdeCarrito:", e);
      res.status(500).json({ error: e.message || "Error al crear la orden" });
    }
  }

  async eliminarCitas(req, res) {
    await citasService.eliminarLasCitas(req.params.id);
    res.json({ message: "Citas eliminado" });
  }

  async obtenerHorariosOcupados(req, res) {
    const { fecha } = req.params;

    if (!fecha) {
      return res
        .status(400)
        .json({ error: "La fecha es requerida en formato YYYY-MM-DD" });
    }

    try {
      const citas = await citasService.obtenerCitasPorFecha(fecha);
      res.json(
        citas.map((cita) => ({
          id: cita.id,
          fecha: cita.fecha,
          tipo: cita.tipo,
          duracion: cita.tipo === "evaluacion" ? 30 : 150,
        }))
      );
    } catch (error) {
      console.error("Error al obtener horarios ocupados:", error);
      res.status(500).json({ error: "Error al obtener horarios ocupados" });
    }
    console.log("Fecha recibida:", fecha);
  }
}

module.exports = new CitasControllers();
