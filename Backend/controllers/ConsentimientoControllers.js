const consentimientoService = require("../services/ConsentimientoService");
const { citas, ordenes, procedimientos, usuarios } = require("../models");
class ConsentimientoController {
  async obtenerConsentimientosPorUsuario(req, res) {
    try {
      const id_usuario = req.usuario.id;
      const consentimientos =
        await consentimientoService.obtenerConsentimientosPorUsuario(
          id_usuario
        );
      return res.json(consentimientos);
    } catch (error) {
      console.error("Error en obtenerConsentimientosPorUsuario:", error);
      return res
        .status(500)
        .json({ error: "Error al obtener los consentimientos del usuario" });
    }
  }

  async obtenerConsentimientosPorCita(req, res) {
    try {
      const { id_cita } = req.params;
      const consentimientos =
        await consentimientoService.obtenerConsentimientosPorCita(id_cita);
      return res.json(consentimientos);
    } catch (error) {
      console.error("Error en obtenerConsentimientosPorCita:", error);
      return res
        .status(500)
        .json({ error: "Error al obtener los consentimientos de la cita" });
    }
  }

  async agregarConsentimiento(req, res) {
    try {
      const { id_cita, texto_terminos } = req.body;
      const id_usuario = req.usuario.id;

      const nuevoConsentimiento =
        await consentimientoService.crearConsentimiento({
          id_usuario,
          id_cita,
          texto_terminos,
          fecha_firma: new Date(),
          ip_firma: req.ip,
        });

      res.status(201).json(nuevoConsentimiento);
    } catch (error) {
      console.error("Error en agregarConsentimiento:", error);
      res.status(500).json({ error: "Error al agregar el consentimiento" });
    }
  }

  async eliminarConsentimiento(req, res) {
    try {
      const { id } = req.params;
      await consentimientoService.eliminarConsentimiento(id);
      res.json({ mensaje: "Consentimiento eliminado" });
    } catch (error) {
      console.error("Error en eliminarConsentimiento:", error);
      res.status(500).json({ error: "Error al eliminar el consentimiento" });
    }
  }

  async limpiarConsentimientos(req, res) {
    try {
      const id_usuario = req.usuario.id;
      await consentimientoService.limpiarConsentimientosPorUsuario(id_usuario);
      res.json({ mensaje: "Consentimientos limpiados correctamente" });
    } catch (error) {
      console.error("Error en limpiarConsentimientos:", error);
      res.status(500).json({ error: "Error al limpiar los consentimientos" });
    }
  }

  async descargarConsentimiento(req, res) {
    try {
      const { id } = req.params;
      const consentimiento = await consentimientoService.obtenerPorId(id);

      if (!consentimiento) {
        return res.status(404).json({ error: "Consentimiento no encontrado" });
      }

      const cita = await citas.findByPk(consentimiento.id_cita);
      if (!cita) {
        return res.status(404).json({ error: "Cita asociada no encontrada" });
      }
      const usuario = await usuarios.findByPk(consentimiento.id_usuario);
      if (!usuario) {
        return res
          .status(404)
          .json({ error: "Usuario asociado no encontrado" });
      }
      const orden = await ordenes.findByPk(cita.id_orden, {
        include: [
          {
            model: procedimientos,
            as: "procedimientos",
            through: { attributes: [] },
          },
        ],
      });

      if (!orden) {
        return res
          .status(404)
          .json({ error: "Orden asociada a la cita no encontrada" });
      }

      const procedimientosAutorizados = Array.isArray(orden.procedimientos)
        ? orden.procedimientos
        : [];

      const { publicId, url, hash } =
        await consentimientoService.generarConsentimientoPDF(
          consentimiento,
          cita,
          orden,
          usuario,
          procedimientosAutorizados
        );

      try {
        await consentimientoService.actualizarPDFMetadata(
          consentimiento.id,
          url,
          hash
        );
      } catch (metaErr) {
        console.warn("No se pudo actualizar metadatos del PDF:", metaErr);
      }

      const cloudinary = require("../config/cloudinary");
      const urlDescarga = cloudinary.utils.private_download_url(
        publicId,
        "pdf",
        {
          resource_type: "raw",
          type: "private",
          expires_at: Math.floor(Date.now() / 1000) + 60,
        }
      );

      return res.json({ url: urlDescarga, publicId });
    } catch (error) {
      console.error("Error en descargarConsentimiento:", error);
      res.status(500).json({ error: "Error al generar el PDF" });
    }
  }
}

module.exports = new ConsentimientoController();
