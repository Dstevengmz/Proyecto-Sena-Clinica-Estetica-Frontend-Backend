const { consentimiento } = require("../models");
const PDFDocument = require("pdfkit");
const crypto = require("crypto");
const cloudinary = require("../config/cloudinary");
class ConsentimientoService {
  async crearConsentimiento(datos) {
    return await consentimiento.create(datos);
  }

  async obtenerConsentimientosPorUsuario(id_usuario) {
    return await consentimiento.findAll({ where: { id_usuario } });
  }

  async obtenerConsentimientosPorCita(id_cita) {
    return await consentimiento.findAll({ where: { id_cita } });
  }

  async eliminarConsentimiento(id) {
    return await consentimiento.destroy({ where: { id } });
  }

  async limpiarConsentimientosPorUsuario(id_usuario) {
    return await consentimiento.destroy({ where: { id_usuario } });
  }

  async generarConsentimientoPDF(
    consentimiento,
    cita,
    orden,
    usuario,
    procedimientos
  ) {
    // Generar PDF en memoria
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));

    // Encabezado
    doc.fontSize(18).text("CONCENTIMIENTO INFORMADO", { align: "center" });
    doc.moveDown();

    // Usuario
    doc.fontSize(12).text(`Paciente: ${usuario.nombre ?? ""}`);
    doc.text(
      `Documento: ${usuario.tipodocumento ?? ""} ${
        usuario.numerodocumento ?? ""
      }`
    );
    doc.text(`Correo: ${usuario.correo ?? ""}`);
    doc.moveDown();

    // Cita
    doc.text(`Cita ID: ${cita.id}`);
    if (cita.fecha) doc.text(`Fecha de la cita: ${cita.fecha}`);
    if (cita.id_doctor) doc.text(`Doctor ID: ${cita.id_doctor}`);
    doc.moveDown();

    // Orden y procedimientos
    doc.text(`Orden ID: ${orden.id}`);
    doc.moveDown();
    doc.text("Procedimientos autorizados:");
    (procedimientos || []).forEach((p, i) => {
      const nombre = p?.nombre ?? "Procedimiento";
      const precio = p?.precio != null ? `$${p.precio}` : "";
      doc.text(`${i + 1}. ${nombre}${precio ? " - " + precio : ""}`);
    });
    doc.moveDown();

    if (consentimiento.texto_terminos) {
      doc.font("Times-Roman").text(consentimiento.texto_terminos, {
        align: "justify",
      });
      doc.moveDown();
    }

    if (consentimiento.fecha_firma)
      doc.fontSize(10).text(`Fecha de firma: ${consentimiento.fecha_firma}`);
    if (consentimiento.ip_firma)
      doc.text(`IP de firma: ${consentimiento.ip_firma}`);

    // Finalizar
    const uploaded = await new Promise((resolve, reject) => {
      doc.on("end", async () => {
        try {
          const pdfBuffer = Buffer.concat(buffers);
          const hash = crypto
            .createHash("sha256")
            .update(pdfBuffer)
            .digest("hex");

          const folder = "consentimientos";
          const public_id = `consentimiento_${consentimiento.id}`;
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "raw",
              type: "private",
              folder,
              public_id,
              format: "pdf",
              overwrite: true,
            },
            (error, result) => {
              if (error) return reject(error);
              resolve({ result, hash });
            }
          );
          stream.end(pdfBuffer);
        } catch (e) {
          reject(e);
        }
      });
      doc.end();
    });

    const { result, hash } = uploaded;
    return {
      publicId: result.public_id,
      url: result.secure_url,
      hash,
    };
  }
  
  async actualizarPDFMetadata(id, ruta_pdf, hash_pdf) {
    await consentimiento.update({ ruta_pdf, hash_pdf }, { where: { id } });
  }
  async obtenerPorId(id) {
    return await consentimiento.findByPk(id);
  }
}

module.exports = new ConsentimientoService();
