const examenService = require("../services/ExamenServices");
const { v2: cloudinary } = require("cloudinary");
const { examen, citas } = require("../models");

class ExamenControllers {
  
  async subir(req, res) {
    try {
      const { id_cita } = req.params;
      const resultados = await examenService.subirArchivos({
        id_cita,
        archivos: req.files,
      });
      res
        .status(201)
        .json({ mensaje: "Exámenes subidos", examenes: resultados });
    } catch (e) {
      console.error("Error al subir exámenes:", e);
      res.status(400).json({ error: e.message || "Error al subir exámenes" });
    }
  }

  async listarPorCita(req, res) {
    try {
      const examenes = await examenService.listarPorCita(req.params.id_cita);
      res.json(examenes);
    } catch (e) {
      res.status(500).json({ error: "Error al listar exámenes" });
    }
  }

  async eliminar(req, res) {
    try {
      const ok = await examenService.eliminar(req.params.id);
      if (!ok) return res.status(404).json({ error: "Examen no encontrado" });
      res.json({ mensaje: "Examen eliminado" });
    } catch (e) {
      res.status(500).json({ error: "Error al eliminar examen" });
    }
  }

  async descargarSeguro(req, res) {
    try {
      const { id } = req.params;
      const usuarioReq = req.usuario; 
      const registro = await examen.findByPk(id, {
        include: { model: citas, as: "cita" },
      });
      if (!registro)
        return res.status(404).json({ error: "Examen no encontrado" });

      const cita = await citas.findByPk(registro.id_cita);
      if (!cita) return res.status(404).json({ error: "Cita no encontrada" });
      const esDoctor =
        usuarioReq.rol === "doctor" &&
        parseInt(cita.id_doctor) === parseInt(usuarioReq.id);
      const esPaciente =
        usuarioReq.rol === "usuario" &&
        parseInt(cita.id_usuario) === parseInt(usuarioReq.id);
      const esAsistente = usuarioReq.rol === "asistente";
      if (!esDoctor && !esPaciente && !esAsistente) {
        return res.status(403).json({ error: "No autorizado" });
      }

      const publicId = registro.archivo_examen;
      if (publicId.startsWith("http")) {
        return res.json({ url: publicId, legacy: true });
      }

      const isPdf = publicId.toLowerCase().endsWith(".pdf");
      let urlFirmada;
      if (isPdf) {
        urlFirmada = cloudinary.utils.private_download_url(publicId, "pdf", {
          resource_type: "raw",
          type: "private",
          expires_at: Math.floor(Date.now() / 1000) + 60,
        });
      } else {
        urlFirmada = cloudinary.url(publicId, {
          sign_url: true,
          type: "private",
          resource_type: "image",
          secure: true,
          expires_at: Math.floor(Date.now() / 1000) + 60,
        });
      }
      return res.json({ url: urlFirmada });
    } catch (e) {
      console.error("Error descarga segura:", e);
      res.status(500).json({ error: "Error al generar URL segura" });
    }
  }
}

module.exports = new ExamenControllers();
