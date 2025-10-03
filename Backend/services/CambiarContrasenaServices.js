const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { usuarios } = require("../models");

const TOKEN_TTL_MS = 60 * 60 * 1000;
const resetTokens = new Map();

class CambiarContrasenaServices {
  async cambiarcontrasena(id_usuario, actual, nueva) {
    const usuario = await usuarios.findByPk(id_usuario);
    if (!usuario) throw new Error("Usuario no encontrado");

    const valido = await bcrypt.compare(actual, usuario.contrasena);
    if (!valido) throw new Error("La contraseña actual es incorrecta");

    if (!nueva || nueva.length < 6) {
      throw new Error("La nueva contraseña debe tener al menos 6 caracteres");
    }

    const igual = await bcrypt.compare(nueva, usuario.contrasena);
    if (igual)
      throw new Error("La nueva contraseña no puede ser igual a la actual");

    const hash = await bcrypt.hash(nueva, 10);
    usuario.contrasena = hash;
    await usuario.save();

    return { message: "Contraseña actualizada correctamente" };
  }

  async solicitarReset(correo) {
    const usuario = await usuarios.findOne({ where: { correo } });
    if (!usuario) throw new Error("Correo no registrado");

    const token = crypto.randomBytes(20).toString("hex");
    resetTokens.set(token, {
      userId: usuario.id,
      expiresAt: Date.now() + TOKEN_TTL_MS,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/resetearcontrasena/${token}`;

    await transporter.sendMail({
      to: correo,
      subject: "Recuperación de contraseña",
      html: `<p>Haz clic en el enlace para restablecer tu contraseña:</p>
             <a href="${resetUrl}">Resetear Contraseña</a>`,
    });

    return { message: "Correo enviado con instrucciones" };
  }

  async resetearPassword(token, nueva) {
    const entry = resetTokens.get(token);
    if (!entry || entry.expiresAt < Date.now()) {
      resetTokens.delete(token);
      throw new Error("Token inválido o expirado");
    }

    if (!nueva || nueva.length < 6) {
      throw new Error("La nueva contraseña debe tener al menos 6 caracteres");
    }

    const usuario = await usuarios.findByPk(entry.userId);
    if (!usuario) throw new Error("Usuario no encontrado");

    usuario.contrasena = await bcrypt.hash(nueva, 10);
    await usuario.save();

    resetTokens.delete(token);

    return { message: "Contraseña restablecida correctamente" };
  }
}

module.exports = new CambiarContrasenaServices();
