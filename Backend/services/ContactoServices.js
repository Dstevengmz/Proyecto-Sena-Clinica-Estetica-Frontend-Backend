const nodemailer = require('nodemailer');

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeText(str = '') {
  return String(str).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

class ContactoServices {
  async buildTransporter() {
    const host = process.env.SMTP_HOST || process.env.MAIL_HOST;
    const port = Number(process.env.SMTP_PORT || process.env.MAIL_PORT) || 587;
    const user = process.env.SMTP_USER || process.env.MAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.MAIL_PASSWORD;
    const secureEnv = process.env.SMTP_SECURE || process.env.MAIL_SECURE;

    return nodemailer.createTransport({
      host,
      port,
      secure: String(secureEnv || '').toLowerCase() === 'true',
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async enviar({ nombre, email, asunto, mensaje }) {
    const to = process.env.CONTACT_EMAIL || process.env.SMTP_USER || process.env.MAIL_USER;
    if (!to) {
      const e = new Error('No hay destinatario configurado (CONTACT_EMAIL, SMTP_USER o MAIL_USER)');
      e.status = 500;
      throw e;
    }

    const safeName = sanitizeText(nombre || '').slice(0, 100);
    const safeEmail = String(email || '').trim().slice(0, 200);
    const safeSubject = sanitizeText(asunto || 'Nuevo mensaje desde el formulario de contacto').slice(0, 150);
    const safeMessageText = String(mensaje || '').replace(/\r\n/g, '\n').slice(0, 5000);
    const safeMessageHtml = `<p>${escapeHtml(safeMessageText).replace(/\n/g, '<br/>')}</p>`;

  const fromAddress = process.env.SMTP_USER || process.env.MAIL_USER || process.env.CONTACT_EMAIL || to;
    const fromName = process.env.CONTACT_FROM_NAME || 'Clinestetica';
    const from = fromAddress ? `${fromName} <${fromAddress}>` : undefined;

    const transporter = await this.buildTransporter();
    const info = await transporter.sendMail({
      from,
      to,
      subject: safeSubject,
      text: `Nombre: ${safeName}\nEmail: ${safeEmail}\n\n${safeMessageText}`,
      html: `<p><strong>Nombre:</strong> ${escapeHtml(safeName)}<br/><strong>Email:</strong> ${escapeHtml(safeEmail)}</p>${safeMessageHtml}`,
      replyTo: safeEmail || undefined,
    });
    return info;
  }
}

module.exports = new ContactoServices();
