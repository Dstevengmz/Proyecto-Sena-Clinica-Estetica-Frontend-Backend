const ChatServices = require('../services/ChatServices');

class chatController {
  async consultarchat(req, res) {
    try {
      const { mensaje } = req.body || {};
      if (!mensaje || typeof mensaje !== 'string') {
        return res.status(400).json({ ok: false, mensaje: 'Mensaje inválido' });
      }

      const resultado = await ChatServices.consultarr(mensaje);  
      return res.json(resultado);
    } catch (error) {
      console.error('ChatController.consultar error', error);
      return res.status(500).json({ ok: false, mensaje: 'Error en el chat' });
    }
  }
}

module.exports = new chatController();
