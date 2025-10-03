const usuarioService = require("../services/CambiarContrasenaServices");

class CambiarContrasenaController {
async cambiarcontrasena(req, res) {
    try {
      const { actual, nueva } = req.body;
      const id_usuario = req.usuario.id;
      const result = await usuarioService.cambiarcontrasena(id_usuario, actual, nueva);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
  async solicitarReset(req, res) {
    try {
      const { correo } = req.body;
      const result = await usuarioService.solicitarReset(correo);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }


  async resetearPassword(req, res) {
    try {
      const { token } = req.params;
      const { nueva } = req.body;
      const result = await usuarioService.resetearPassword(token, nueva);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new CambiarContrasenaController();
