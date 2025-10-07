const nodemailer = require("nodemailer");

class ContactoServices {
  // 🔹 Métodos utilitarios dentro de la clase
  escapeHtml(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  sanitizeText(str = "") {
    return String(str)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .trim();
  }

  // 🔹 Crea el transporte de correo
  async buildTransporter() {
    const host = process.env.SMTP_HOST || process.env.MAIL_HOST;
    const port = Number(process.env.SMTP_PORT || process.env.MAIL_PORT) || 587;
    const user = process.env.SMTP_USER || process.env.MAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.MAIL_PASSWORD;
    const secureEnv = process.env.SMTP_SECURE || process.env.MAIL_SECURE;

    return nodemailer.createTransport({
      host,
      port,
      secure: String(secureEnv || "").toLowerCase() === "true",
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  // 🔹 Envía el correo de contacto
  async enviar({ nombre, email, asunto, mensaje }) {
    const to =
      process.env.CONTACT_EMAIL ||
      process.env.SMTP_USER ||
      process.env.MAIL_USER;

    if (!to) {
      const e = new Error(
        "No hay destinatario configurado (CONTACT_EMAIL, SMTP_USER o MAIL_USER)"
      );
      e.status = 500;
      throw e;
    }

    // ✅ Usa los métodos internos de la clase
    const safeName = this.sanitizeText(nombre || "").slice(0, 100);
    const safeEmail = String(email || "").trim().slice(0, 200);
    const safeSubject = this.sanitizeText(
      asunto || "Nuevo mensaje desde el formulario de contacto"
    ).slice(0, 150);
    const safeMessageText = String(mensaje || "")
      .replace(/\r\n/g, "\n")
      .slice(0, 5000);
    const safeMessageHtml = `<p>${this.escapeHtml(safeMessageText).replace(
      /\n/g,
      "<br/>"
    )}</p>`;

    // fromAddress puede derivarse de las mismas variables que 'to'.
    // No añadimos '|| to' ni rama alternativa para evitar ramas inalcanzables.
    const fromAddress =
      process.env.SMTP_USER ||
      process.env.MAIL_USER ||
      process.env.CONTACT_EMAIL;
    const fromName = process.env.CONTACT_FROM_NAME || "Clinestetica";
    // Dado que arriba validamos 'to', aquí asumimos fromAddress definido y eliminamos la rama else.
    const from = `${fromName} <${fromAddress}>`;

    const transporter = await this.buildTransporter();
    const info = await transporter.sendMail({
      from,
      to,
      subject: safeSubject,
      text: `Nombre: ${safeName}\nEmail: ${safeEmail}\n\n${safeMessageText}`,
      html: `<p><strong>Nombre:</strong> ${this.escapeHtml(
        safeName
      )}<br/><strong>Email:</strong> ${this.escapeHtml(
        safeEmail
      )}</p>${safeMessageHtml}`,
      replyTo: safeEmail || undefined,
    });
    return info;
  }
}

module.exports = new ContactoServices();
