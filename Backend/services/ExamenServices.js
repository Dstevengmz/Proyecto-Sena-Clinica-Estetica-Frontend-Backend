const { examen } = require('../models');

class ExamenServices {
  async subirArchivos({ id_cita, archivos }) {
    if (!archivos || archivos.length === 0) {
      throw new Error('No se enviaron archivos');
    }
    const registros = await Promise.all(
      archivos.map(async (file) => {
        // Log para depuración de estructura proporcionada por multer-storage-cloudinary
        console.log('Archivo subido Cloudinary:', {
          originalname: file.originalname,
          path: file.path,
          filename: file.filename,
          secure_url: file.secure_url,
          url: file.url,
          mimetype: file.mimetype,
          size: file.size,
        });
        // Guardar public_id (file.filename) para generar URL firmada luego.
        const publicId = file.filename; // ej: examenes/123_nombre.pdf
        if (!publicId) throw new Error('No se obtuvo public_id del archivo');
        return await examen.create({
          id_cita,
          nombre_examen: file.originalname,
          archivo_examen: publicId, // almacenamos public_id, NO URL
          observaciones: null,
        });
      })
    );
    return registros;
  }

  async listarPorCita(id_cita) {
    return await examen.findAll({ where: { id_cita }, order: [['id','ASC']] });
  }

  async eliminar(id) {
    const registro = await examen.findByPk(id);
    if (!registro) return null;
    await registro.destroy();
    return true;
  }
}

module.exports = new ExamenServices();
