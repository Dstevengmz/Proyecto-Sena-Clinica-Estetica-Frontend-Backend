const ContactoService = require('../services/ContactoServices');

const required = (name, value) => {
  if (!value || String(value).trim() === '') {
    const err = new Error(`El campo ${name} es obligatorio`);
    err.status = 400;
    throw err;
  }
};


class ContactoController {
  static async enviar(req, res) {
    try {
      const { nombre, email, asunto, mensaje } = req.body || {};
      required('nombre', nombre);
      required('email', email);
      required('mensaje', mensaje);

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(email))) {
        const err = new Error('El email no es válido');
        err.status = 400;
        throw err;
      }
      if (String(nombre).length > 100) {
        const err = new Error('El nombre es demasiado largo (máx 100)');
        err.status = 400;
        throw err;
      }
      if (String(asunto || '').length > 150) {
        const err = new Error('El asunto es demasiado largo (máx 150)');
        err.status = 400;
        throw err;
      }
      if (String(mensaje).length > 5000) {
        const err = new Error('El mensaje es demasiado largo (máx 5000)');
        err.status = 400;
        throw err;
      }

  const info = await ContactoService.enviar({ nombre, email, asunto, mensaje });

      res.json({ ok: true, messageId: info.messageId });
    } catch (err) {
      const status = err.status || 500;
      res.status(status).json({ error: err.message || 'No se pudo enviar el mensaje' });
    }
  }
}

module.exports = ContactoController;