const citasService = require("../services/CitasServices");
const PDFDocument = require("pdfkit");

class CitasControllers {
  
async listarPacientesPorDoctor(req, res) {
  try {
    const doctorId = req.usuario.id;
    const pacientes = await citasService.listarPacientesPorDoctor(doctorId);
    res.json(pacientes);
  } catch (error) {
    console.error("Error en listarPacientesPorDoctor:", error);
    res.status(500).json({ error: "Error al listar pacientes" });
  }
}

async listarCitasPorUsuarioYDoctor(req, res) {
  try {
    const { usuarioId } = req.params;
    const doctorId = req.usuario.id;
    const citasPaciente = await citasService.listarCitasPorUsuarioYDoctor(
      usuarioId,
      doctorId
    );
    res.json(citasPaciente);
  } catch (error) {
    console.error("Error en listarCitasPorUsuarioYDoctor:", error);
    res.status(500).json({ error: "Error al listar citas del paciente" });
  }
}





  // Arriba se agrego nuevo
  async listarCitas(req, res) {
    try {
      const rol = req.usuario.rol;
      let doctorId = null;

      if (rol === "doctor") {
        doctorId = req.usuario.id;
      } else if (rol === "asistente" || rol === "usuario") {
        const { doctorId: doctorIdQuery } = req.query;
        if (!doctorIdQuery) {
          return res.json([]);
        }
        if (isNaN(doctorIdQuery)) {
          return res.status(400).json({ error: "doctorId inválido" });
        }
        doctorId = parseInt(doctorIdQuery, 10);
      }

      const citas = await citasService.listarLasCitas(doctorId);
      return res.json(citas);
    } catch (error) {
      console.error("Error al listar citas:", error);
      res.status(500).json({
        error: "Error al obtener las citas",
        message: error.message,
      });
    }
  }


async cancelarCita(req, res) {
  try {
    const { id } = req.params;

    const resultado = await citasService.actualizarLasCitas(id, {
      estado: "cancelada",
    });

    if (!resultado[0]) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    res.json({ mensaje: "Cita cancelada correctamente" });
  } catch (e) {
    console.error("Error al cancelar cita:", e);
    res.status(500).json({ error: "Error en el servidor al cancelar la cita" });
  }
}


  async buscarCitas(req, res) {
    try {
      const citas = await citasService.buscarLasCitas(req.params.id);
      citas
        ? res.json(citas)
        : res.status(404).json({ error: "Citas no encontrado" });
    } catch (e) {
      res
        .status(500)
        .json({ error: "Error en el servidor al buscar el Citas" });
      console.log(e);
    }
  }

  async crearCitas(req, res) {
    try {
      const payload = { ...req.body };
      const rol = req.usuario?.rol;
      if (rol === "usuario") {
        if (payload.tipo && payload.tipo !== "evaluacion") {
          return res.status(400).json({
            message:
              "No es posible crear citas de tipo 'procedimiento' desde el portal del usuario. Solo se permiten citas de 'evaluación'.",
          });
        }
        payload.tipo = "evaluacion";
      } else {
        if (!payload.tipo) payload.tipo = "evaluacion";
        if (!["evaluacion", "procedimiento"].includes(payload.tipo)) {
          return res.status(400).json({ message: "Tipo de cita inválido." });
        }
      }
      payload._rol_creador = rol;

      const nuevocitas = await citasService.crearLasCitas(payload);

      if (nuevocitas && nuevocitas.id_doctor) {
        await citasService.notificarTotalCitas(nuevocitas.id_doctor);
      }
      res.status(201).json(nuevocitas);
    } catch (error) {
      console.error("Error al crear Citas:", error);
      const status = error.status || 500;
      res.status(status).json({
        message: "Hubo un error al crear el Citas",
        error: error.message,
      });
    }
  }

async actualizarCitaUsuario(req, res) {
  try {
    const { id } = req.params;
    const { fecha } = req.body;

    const resultado = await citasService.actualizarLasCitas(id, { fecha });
    if (!resultado[0]) return res.status(404).json({ error: "Cita no encontrada" });
    res.json({ mensaje: "Cita reagendada correctamente" });
  } catch (e) {
    res.status(500).json({ error: "Error al reagendar la cita" });
  }
}

async actualizarCitaDoctor(req, res) {
  try {
    const { id } = req.params;
    const { estado, observaciones, examenes_requeridos, nota_evolucion } = req.body;

    const resultado = await citasService.actualizarLasCitas(id, {
      estado,
      observaciones,
      examenes_requeridos,
      nota_evolucion,
    });
    if (!resultado[0]) return res.status(404).json({ error: "Cita no encontrada" });
    res.json({ mensaje: "Cita actualizada por doctor" });
  } catch (e) {
    res.status(500).json({ error: "Error al actualizar la cita" });
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
    const { doctorId } = req.query;

    if (!fecha) {
      return res
        .status(400)
        .json({ error: "La fecha es requerida en formato YYYY-MM-DD" });
    }

    try {
      const citas = await citasService.obtenerCitasPorFecha(
        fecha,
        doctorId || null
      );
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
    console.log("Fecha recibida:", fecha, "doctorId:", doctorId);
  }

  async citasPorDia(req, res) {
    const { doctorId } = req.params; // Recibir doctorId de la URL
    const { fecha } = req.query; // Recibir la fecha de la consulta (ej: 2025-08-05)

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
      const citas = await citasService.obtenerCitasPorRango(
        doctorId,
        desde,
        hasta
      );

      if (citas.length > 0) {
        res.json(citas);
      } else {
        res
          .status(404)
          .json({ message: "No hay citas en este rango de fechas." });
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
      const citas = await citasService.obtenerCitasPorTipo(
        doctorId,
        tipo,
        fecha
      );

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
  async misCitas(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const citas = await citasService.obtenerMisCitas(usuarioId);
      res.json(citas);
    } catch (error) {
      console.error("Error al obtener mis citas:", error);
      res.status(500).json({ error: "Error al obtener mis citas" });
    }
  }
  async actualizarEstadoCita(req, res) {
    try {
      const { id } = req.params;
      const { estado = "realizada" } = req.body;
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      const doctorId = req.usuario.id;
      const resultado = await citasService.cambiarEstadoCita({
        id,
        estado,
        doctorId,
      });
      if (!resultado) {
        return res.status(404).json({ error: "Cita no encontrada" });
      }
      res.json({
        mensaje: "Estado de la cita actualizado correctamente",
        cita: resultado,
      });
    } catch (e) {
      const status = e.status || 500;
      res.status(status).json({
        error: e.message || "Error en el servidor al actualizar la cita",
      });
    }
  }

  async generarPDFExamenes(req, res) {
    try {
      const { id } = req.params;
      const cita = await citasService.buscarLasCitas(id);
      if (!cita) return res.status(404).json({ error: "Cita no encontrada" });
      if (!cita.examenes_requeridos)
        return res
          .status(400)
          .json({ error: "La cita no tiene exámenes requeridos" });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="orden_examenes_cita_${id}.pdf"`
      );
      const doc = new PDFDocument({ margin: 40 });
      doc.pipe(res);

      const ancho = doc.page.width;
      const alto = doc.page.height;
      const fechaLocal = (() => {
        try {
          return new Date(cita.fecha).toLocaleString("es-CO");
        } catch {
          return String(cita.fecha);
        }
      })();

      // Borde exterior
      doc
        .lineWidth(1.2)
        .rect(30, 30, ancho - 60, alto - 60)
        .stroke("#000");

      // Watermark (símbolo médico)
      doc.save();
      doc
        .fontSize(200)
        .fillColor("#666")
        .opacity(0.05)
        .text("⚕", 0, alto / 3.5, { align: "center" });
      doc.restore();

      doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .fillColor("#000")
        .text(
          (cita.doctor?.nombre || "DR. NO REGISTRADO").toUpperCase(),
          0,
          50,
          { align: "center" }
        );
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(cita.doctor?.ocupacion || "Médico", { align: "center" });
      doc.moveDown(0.2);
      doc
        .lineWidth(3)
        .moveTo(60, doc.y + 5)
        .lineTo(ancho - 60, doc.y + 5)
        .stroke("#000");
      doc.moveDown(1.2);

      // Sección datos paciente / cita
      const startX = 55;
      const label = (y, titulo, valor) => {
        doc
          .font("Helvetica-Bold")
          .fontSize(9)
          .fillColor("#000")
          .text(titulo.toUpperCase() + ":", startX, y, { continued: true });
        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor("#111")
          .text(" " + (valor || "—"));
      };

      let y = doc.y;
      label(y, "ID Cita", cita.id);
      y = doc.y + 4;
      label(y, "Nombre Paciente", cita.usuario?.nombre);
      y = doc.y + 4;
      label(y, "Fecha Cita", fechaLocal);
      y = doc.y + 4;
      label(y, "Tipo", cita.tipo);
      y = doc.y + 4;

      // Separador
      doc
        .moveTo(55, y)
        .lineTo(ancho - 55, y)
        .stroke("#999");
      y += 15;

      // Sección Exámenes
      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .fillColor("#000")
        .text("PRESCRIPCIÓN / ORDEN DE EXÁMENES", startX, y, {
          width: ancho - 110,
          align: "center",
        });
      y = doc.y + 8;

      doc.font("Helvetica-Bold").fontSize(10).text("Se solicita:", 55, y);
      y = doc.y + 4;
      const examLines = cita.examenes_requeridos
        .split(/\r?\n+/)
        .filter((l) => l.trim());
      doc.font("Helvetica").fontSize(11).fillColor("#111");
      examLines.forEach((linea, idx) => {
        const safe = linea.trim();
        doc.text(`${idx + 1}. ${safe}`, { width: ancho - 110, align: "left" });
      });
      y = doc.y + 12;

      // Observaciones / Diagnóstico (usa observaciones si hay)
      if (cita.observaciones) {
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor("#000")
          .text("Observaciones / Diagnóstico:", 55, y);
        y = doc.y + 4;
        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor("#111")
          .text(cita.observaciones, { width: ancho - 110 });
        y = doc.y + 12;
      }

      // Línea firma
      const firmaY = alto - 170;
      try {
        const path = require("path");
        const firmaPath = path.join(__dirname, "../assets/img/firma.png");
        doc.image(firmaPath, ancho - 220, firmaY - 60, { width: 120 });
      } catch (err) {
        console.warn("No se encontró imagen de firma:", err.message);
      }
      doc
        .moveTo(ancho - 250, firmaY)
        .lineTo(ancho - 70, firmaY)
        .stroke("#000");
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("SELLO Y FIRMA DEL MÉDICO", ancho - 250, firmaY + 5, {
          width: 180,
          align: "center",
        });

      // Footer
      const footerY = alto - 90;
      doc
        .moveTo(55, footerY)
        .lineTo(ancho - 55, footerY)
        .stroke("#000");
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .text("Clinestetica", 55, footerY + 8, { align: "left" });
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#333")
        .text(
          "Documento generado automáticamente - No requiere firma manuscrita si contiene firma digital.",
          55,
          footerY + 25,
          { width: ancho - 110, align: "center" }
        );
      doc
        .fontSize(7)
        .fillColor("#777")
        .text(
          `Generado: ${new Date().toLocaleString("es-CO")}`,
          55,
          footerY + 40,
          { align: "center" }
        );

      doc.end();
    } catch (e) {
      console.error("Error generando PDF exámenes:", e);
      res.status(500).json({ error: "Error al generar PDF" });
    }
  }

  async marcarExamenesSubidos(req, res) {
    try {
      const { id } = req.params; 
      if (req.usuario.rol !== "usuario") {
        return res.status(403).json({
          error: "Solo el paciente puede marcar sus exámenes como subidos",
        });
      }
      const cita = await citasService.marcarExamenesSubidos({
        id_cita: id,
        id_usuario_que_confirma: req.usuario.id,
      });
      res.json({ mensaje: "Exámenes marcados como subidos", cita });
    } catch (e) {
      const status = e.status || 500;
      res
        .status(status)
        .json({ error: e.message || "Error al marcar exámenes" });
    }
  }
}
module.exports = new CitasControllers();
