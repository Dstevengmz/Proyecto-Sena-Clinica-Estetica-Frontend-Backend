const nodemailer = require("nodemailer");
require('dotenv').config();

console.log("HOST:", process.env.MAIL_HOST);
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

function EnviarCorreo({receipients,subject,message}) {
    (async () => {
      const info = await transporter.sendMail({
        from: '"Clinestetica" <juanmenxz9@gmail.com>',
        to: receipients,
        subject: subject,
        text: message,
        html: message,
      });
      console.log("MAIL_HOST:", process.env.MAIL_HOST);
      console.log("Mensaje Enviado:", info.messageId);
    })();
}

module.exports = { EnviarCorreo };