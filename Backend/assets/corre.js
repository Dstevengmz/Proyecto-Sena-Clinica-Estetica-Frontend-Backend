const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: process.env.MAIL_SECURE === "true" || false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

async function EnviarCorreo({ receipients, subject, message, attachments }) {
  try {
    const mailOptions = {
      from: `"Clinestetica" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
      to: receipients,
      subject,
      text: message.replace(/<[^>]+>/g, ""),
      html: message,
    };

    if (attachments) mailOptions.attachments = attachments;

    const info = await transporter.sendMail(mailOptions);
    console.log("Mensaje Enviado:", info.messageId);
    return info;
  } catch (err) {
    console.error("Error enviando correo:", err);
    throw err;
  }
}

module.exports = { EnviarCorreo };