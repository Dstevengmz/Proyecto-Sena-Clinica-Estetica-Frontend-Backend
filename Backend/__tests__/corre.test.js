/*
  Propósito del archivo:
  Pruebas unitarias para la utilidad de envío de correos (assets/corre): verifica que se construyan y envíen los parámetros correctos a nodemailer.

  Cobertura de pruebas:
  - Crea el transporter con variables de entorno y llama a sendMail con from/to/subject/text/html esperados.
*/

describe('Utilidad EnviarCorreo', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.MAIL_HOST = "smtp.test";
    process.env.MAIL_PORT = "25";
    process.env.MAIL_USER = "user";
    process.env.MAIL_PASSWORD = "pass";
  });

  test("llama sendMail con los parámetros correctos", async () => {
    const sendMailMock = jest.fn().mockResolvedValue({ messageId: "abc" });
    let EnviarCorreo;
    jest.isolateModules(() => {
      jest.doMock("nodemailer", () => ({
        createTransport: () => ({ sendMail: sendMailMock }),
      }));
      ({ EnviarCorreo } = require("../assets/corre"));
    });

    EnviarCorreo({ receipients: "a@b.com", subject: "Hola", message: "Test" });
    await new Promise((r) => setImmediate(r));

    expect(sendMailMock).toHaveBeenCalledWith({
      from: '"Clinestetica" <juanmenxz9@gmail.com>',
      to: "a@b.com",
      subject: "Hola",
      text: "Test",
      html: "Test",
    });
  });
});
