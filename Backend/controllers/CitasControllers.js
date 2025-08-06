const citasService = require("../services/CitasServices");

class CitasControllers {
  async listarCitas(req, res) {
    try {
      // Si es doctor, solo ve sus propias citas
      // Si es asistente, ve todas las citas
      const doctorId = req.usuario.rol === "doctor" ? req.usuario.id : null;
      const citas = await citasService.listarLasCitas(doctorId);
      res.json(citas);
    } catch (error) {
      console.error("Error al listar citas:", error);
      res.status(500).json({ 
        error: "Error al obtener las citas",
        message: error.message 
      });
    }
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
  
async citasPorDia(req, res) {
    const { doctorId } = req.params;  // Recibir doctorId de la URL
    const { fecha } = req.query;      // Recibir la fecha de la consulta (ej: 2025-08-05)

    try {
      // Llamar al servicio para obtener las citas del doctor en el día solicitado
      const citas = await citasService.obtenerCitasPorDia(doctorId, fecha);

      if (citas.length > 0) {
        res.json(citas);
      } else {
        res.status(404).json({ message: "No hay citas para este día." });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async citasPorRango(req, res) {
    const { doctorId } = req.params;
    const { desde, hasta } = req.query; 

    try {
      const citas = await citasService.obtenerCitasPorRango(doctorId, desde, hasta);

      if (citas.length > 0) {
        res.json(citas);
      } else {
        res.status(404).json({ message: "No hay citas en este rango de fechas." });
      }
    } catch (error) {
      console.error("Error al obtener citas por rango:", error);
      res.status(500).json({ error: error.message });
    }
  }
  async citasPorTipo(req, res) {
    const { doctorId } = req.params;
    const { tipo } = req.query;
    const { fecha } = req.query;

    try {
      const citas = await citasService.obtenerCitasPorTipo(doctorId, tipo,fecha);

      if (citas.length > 0) {
        res.json(citas);
      } else {
        res.status(404).json({ message: `No hay citas de tipo ${tipo}.` });
      }
    } catch (error) {
      console.error("Error al obtener citas por tipo:", error);
      res.status(500).json({ error: error.message });
    }
  }
}
module.exports = new CitasControllers();