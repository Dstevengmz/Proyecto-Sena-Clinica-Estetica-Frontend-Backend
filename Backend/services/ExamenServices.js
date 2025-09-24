const { examen,citas } = require('../models');
class ExamenServices {
  async subirArchivos({ id_cita, archivos }) {
    if (!archivos || archivos.length === 0) {
      throw new Error('No se enviaron archivos');
    }
    
    const cita = await citas.findByPk(id_cita);
    if (!cita) throw new Error('Cita no encontrada');
    if (cita.examenes_cargados) {
      throw new Error('Los exámenes ya fueron marcados como finalizados para esta cita');
    }
    const registros = await Promise.all(
      archivos.map(async (file) => {
        console.log('Archivo subido Cloudinary:', {
          originalname: file.originalname,
          path: file.path,
          filename: file.filename,
          secure_url: file.secure_url,
          url: file.url,
          mimetype: file.mimetype,
          size: file.size,
        });
        const publicId = file.filename; 
        if (!publicId) throw new Error('No se obtuvo public_id del archivo');
        return await examen.create({
          id_cita,
          nombre_examen: file.originalname,
          archivo_examen: publicId, 
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
