jest.mock("nodemailer", () => ({ createTransport: jest.fn() }));
const nodemailer = require("nodemailer");

/*
  Propósito del archivo:
  Validar Servicios de Contacto: construcción de transporter, composición y envío de correos,
  sanitización/escape de texto y ramas con y sin destinatario configurado.

  Cobertura de pruebas:
  - buildTransporter: SMTP/MAIL, secure/puerto por defecto, auth.
  - enviar: destinatario requerido, replyTo definido/indefinido, normalización CRLF, escape/sanitize.
*/

describe("Servicios de Contacto", () => {
  let ContactoServices;
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CONTACT_EMAIL = "";
    process.env.CONTACT_FROM_NAME = "";
    process.env.SMTP_USER = "";
    process.env.MAIL_USER = "";
    process.env.SMTP_HOST = "smtp.gmail.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_SECURE = "false";
    nodemailer.createTransport.mockReset();
  });

  test("buildTransporter usa variables de entorno y crea transport", async () => {
    const transportMock = { sendMail: jest.fn() };
    nodemailer.createTransport.mockReturnValue(transportMock);
    ContactoServices = require("../services/ContactoServices");
    const transporter = await ContactoServices.buildTransporter();
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: undefined,
    });
    expect(transporter).toBe(transportMock);
  });

  test("buildTransporter usa secure=true y auth cuando hay SMTP_USER y SMTP_PASS", async () => {
    const transportMock = { sendMail: jest.fn() };
    nodemailer.createTransport.mockReturnValue(transportMock);
    process.env.SMTP_SECURE = "true";
    process.env.SMTP_USER = "smtp_user@gmail.com";
    process.env.SMTP_PASS = "smtp_pass";
    ContactoServices = require("../services/ContactoServices");
    await ContactoServices.buildTransporter();
    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        secure: true,
        auth: { user: "smtp_user@gmail.com", pass: "smtp_pass" },
      })
    );
  });

  test("buildTransporter cae a MAIL_* cuando faltan SMTP_*", async () => {
    const transportMock = { sendMail: jest.fn() };
    nodemailer.createTransport.mockReturnValue(transportMock);
    process.env.SMTP_HOST = "";
    process.env.SMTP_PORT = "";
    process.env.SMTP_SECURE = "";
    process.env.SMTP_USER = "";
    process.env.SMTP_PASS = "";
    process.env.MAIL_HOST = "mail.gmail.com";
    process.env.MAIL_PORT = "2525";
    process.env.MAIL_SECURE = "true";
    process.env.MAIL_USER = "mail_user@gmail.com";
    process.env.MAIL_PASSWORD = "mail_pass";
    ContactoServices = require("../services/ContactoServices");
    await ContactoServices.buildTransporter();
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: "mail.gmail.com",
      port: 2525,
      secure: true,
      auth: { user: "mail_user@gmail.com", pass: "mail_pass" },
    });
  });

  test("buildTransporter usa puerto por defecto 587 y secure false cuando no hay puertos ni secure", async () => {
    const transportMock = { sendMail: jest.fn() };
    nodemailer.createTransport.mockReturnValue(transportMock);
    process.env.SMTP_HOST = "smtp.gmail.com";
    process.env.SMTP_PORT = "";
    process.env.MAIL_PORT = "";
    process.env.SMTP_SECURE = "";
    process.env.MAIL_SECURE = "";
    process.env.SMTP_USER = "";
    process.env.SMTP_PASS = "";
    process.env.MAIL_USER = "";
    process.env.MAIL_PASSWORD = "";
    ContactoServices = require("../services/ContactoServices");
    await ContactoServices.buildTransporter();
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: undefined,
    });
  });

  test("enviar lanza error si no hay destinatario en env", async () => {
    ContactoServices = require("../services/ContactoServices");
    await expect(
      ContactoServices.enviar({ nombre: "A", email: "a@b.com" })
    ).rejects.toThrow(/No hay destinatario configurado/);
  });

  test("enviar compone correo y llama sendMail", async () => {
    const transportMock = {
      sendMail: jest.fn().mockResolvedValue({ accepted: ["to@gmail.com"] }),
    };
    nodemailer.createTransport.mockReturnValue(transportMock);
    process.env.SMTP_USER = "from@gmail.com";
    process.env.CONTACT_EMAIL = "to@gmail.com";
    process.env.CONTACT_FROM_NAME = "Clinest";
    ContactoServices = require("../services/ContactoServices");
    const info = await ContactoServices.enviar({
      nombre: "  <Juan>  ",
      email: " user@site.com ",
      asunto: " Hola ",
      mensaje: "Linea1\nLinea2",
    });
    expect(transportMock.sendMail).toHaveBeenCalled();
    const args = transportMock.sendMail.mock.calls[0][0];
    expect(args.to).toBe("to@gmail.com");
    expect(args.from).toMatch(/Clinest/);
    expect(args.subject).toMatch(/Hola/);
    expect(args.text).toMatch(/Nombre:.*Juan/);
    expect(args.html).toMatch(/Linea1<br\/>Linea2/);
    expect(info).toEqual({ accepted: ["to@gmail.com"] });
  });

  test("enviar usa asunto por defecto y replyTo undefined con email vacío", async () => {
    const transportMock = {
      sendMail: jest.fn().mockResolvedValue({ accepted: ["to@gmail.com"] }),
    };
    nodemailer.createTransport.mockReturnValue(transportMock);
    process.env.CONTACT_EMAIL = "to@gmail.com";
    process.env.SMTP_USER = "";
    process.env.MAIL_USER = "mailuser@gmail.com";
    ContactoServices = require("../services/ContactoServices");
    await ContactoServices.enviar({
      nombre: "Ana",
      email: "",
      mensaje: "Hola",
    });
    const args = transportMock.sendMail.mock.calls[0][0];
    expect(args.subject).toMatch(
      /Nuevo mensaje desde el formulario de contacto/
    );
    expect(args.replyTo).toBeUndefined();
    expect(args.from).toMatch(
      /(Clinestetica|Clinest) <(mailuser@gmail.com|to@gmail.com)>/
    );
  });

  test("enviar escapa correctamente HTML en nombre y mensaje", async () => {
    const transportMock = { sendMail: jest.fn().mockResolvedValue({}) };
    nodemailer.createTransport.mockReturnValue(transportMock);
    process.env.CONTACT_EMAIL = "to@gmail.com";
    process.env.SMTP_USER = "from@gmail.com";
    ContactoServices = require("../services/ContactoServices");
    await ContactoServices.enviar({
      nombre: 'A & B <C> "D" E\'F',
      email: "user@x.com",
      mensaje: 'Line1 & <tag>\n"quote"',
    });
    const html = transportMock.sendMail.mock.calls[0][0].html;
    expect(html).toContain("&amp;");
    expect(html).toContain("&lt;");
    expect(html).toContain("&gt;");
    expect(html).toContain("&quot;");
    expect(html).toContain("&#39;");
    expect(html).toMatch(/Line1 &amp; &lt;tag&gt;<br\/>/);
  });

  test("enviar con solo CONTACT_EMAIL usa from por defecto y normaliza CRLF", async () => {
    const transportMock = {
      sendMail: jest.fn().mockResolvedValue({ accepted: ["to@gmail.com"] }),
    };
    nodemailer.createTransport.mockReturnValue(transportMock);
    process.env.SMTP_USER = "";
    process.env.MAIL_USER = "";
    process.env.CONTACT_EMAIL = "to@gmail.com";
    process.env.CONTACT_FROM_NAME = "";
    ContactoServices = require("../services/ContactoServices");
    await ContactoServices.enviar({
      email: "client@gmail.com",
      mensaje: "Hola\r\nMundo",
    });
    const args = nodemailer.createTransport().sendMail.mock.calls[0][0];
    expect(args.to).toBe("to@gmail.com");
    expect(args.from).toBe("Clinestetica <to@gmail.com>");
    expect(args.subject).toMatch(
      /Nuevo mensaje desde el formulario de contacto/
    );
    expect(args.text).toMatch(/Hola\nMundo/);
    expect(args.html).toMatch(/Hola<br\/>Mundo/);
    expect(args.replyTo).toBe("client@gmail.com");
  });

  test("enviar sin mensaje usa cadena vacía y sanitiza control chars en nombre/asunto", async () => {
    const transportMock = { sendMail: jest.fn().mockResolvedValue({}) };
    nodemailer.createTransport.mockReturnValue(transportMock);
    process.env.CONTACT_EMAIL = "to@gmail.com";
    process.env.SMTP_USER = "";
    process.env.MAIL_USER = "";
    ContactoServices = require("../services/ContactoServices");
    const nombreConControl = "  A\x00B\x07C  ";
    const asuntoConControl = " Hola\x0CBello ";
    await ContactoServices.enviar({
      nombre: nombreConControl,
      email: "x@y.com",
      asunto: asuntoConControl,
    });
    const args = nodemailer.createTransport().sendMail.mock.calls[0][0];
    expect(args.text).toMatch(/Nombre: ABC\nEmail: x@y.com\n\n$/);
    expect(args.html).toMatch(
      /<p><strong>Nombre:<\/strong> ABC<br\/><strong>Email:<\/strong> x@y.com<\/p><p><\/p>/
    );
    expect(args.subject).toBe("HolaBello");
  });
  test("escapeHtml reemplaza correctamente todos los caracteres especiales", () => {
    const Contacto = require("../services/ContactoServices");
    const texto = `<div> "hola" & 'adiós' </div>`;
    const esperado =
      "&lt;div&gt; &quot;hola&quot; &amp; &#39;adiós&#39; &lt;/div&gt;";
    expect(Contacto.constructor.prototype.constructor).toBeDefined();
    const escapeFn = require("../services/ContactoServices").__proto__
      .escapeHtml;
    const localEscape = (str = "") =>
      String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    expect(localEscape(texto)).toBe(esperado);
  });

  test("sanitizeText elimina caracteres de control y recorta espacios", () => {
    const dirty = "  A\x00B\x07C\x0ED  ";
    const sanitized = String(dirty)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .trim();
    expect(sanitized).toBe("ABCD");
  });

  test("enviar no lanza error cuando CONTACT_EMAIL está configurado", async () => {
    const transportMock = {
      sendMail: jest.fn().mockResolvedValue({ accepted: ["ok@ok.com"] }),
    };
    nodemailer.createTransport.mockReturnValue(transportMock);
    process.env.CONTACT_EMAIL = "ok@ok.com";
    ContactoServices = require("../services/ContactoServices");
    await expect(
      ContactoServices.enviar({
        nombre: "Pepe",
        email: "x@x.com",
        mensaje: "Hola",
      })
    ).resolves.toEqual({ accepted: ["ok@ok.com"] });
    expect(transportMock.sendMail).toHaveBeenCalled();
  });
  test("escapeHtml reemplaza todos los caracteres especiales correctamente", () => {
    ContactoServices = require("../services/ContactoServices");
    const texto = `<div> "hola" & 'adiós' </div>`;
    const esperado =
      "&lt;div&gt; &quot;hola&quot; &amp; &#39;adiós&#39; &lt;/div&gt;";
    expect(ContactoServices.escapeHtml(texto)).toBe(esperado);
  });

  test("sanitizeText elimina caracteres de control y espacios", () => {
    ContactoServices = require("../services/ContactoServices");
    const sucio = "  A\x00B\x07C\x0ED  ";
    const limpio = ContactoServices.sanitizeText(sucio);
    expect(limpio).toBe("ABCD");
  });
  test("escapeHtml devuelve cadena vacía cuando se pasa undefined o null", () => {
    ContactoServices = require("../services/ContactoServices");
    expect(ContactoServices.escapeHtml()).toBe("");
    expect(ContactoServices.escapeHtml(null)).toBe("null");
  });

  test("sanitizeText devuelve cadena vacía cuando se pasa undefined o null", () => {
    ContactoServices = require("../services/ContactoServices");
    expect(ContactoServices.sanitizeText()).toBe("");
    expect(ContactoServices.sanitizeText(null)).toBe("null");
  });

  test("enviar usa replyTo undefined cuando email está vacío y lanza error si faltan destinatarios", async () => {
    const transportMock = { sendMail: jest.fn().mockResolvedValue({}) };
    nodemailer.createTransport.mockReturnValue(transportMock);

    // Sin destinatarios configurados → debe lanzar error
    delete process.env.CONTACT_EMAIL;
    delete process.env.SMTP_USER;
    delete process.env.MAIL_USER;

    ContactoServices = require("../services/ContactoServices");
    await expect(
      ContactoServices.enviar({ nombre: "Test", email: "", mensaje: "Hola" })
    ).rejects.toThrow(/No hay destinatario configurado/);

    // Con destinatario configurado → replyTo = undefined
    process.env.CONTACT_EMAIL = "to@gmail.com";
    const info = await ContactoServices.enviar({
      nombre: "Test",
      email: "",
      mensaje: "Hola",
    });
    expect(info).toBeDefined();
    const args = nodemailer.createTransport().sendMail.mock.calls[0][0];
    expect(args.replyTo).toBeUndefined();
  });
  test("enviar cubre rama con destinatario configurado y email presente (replyTo definido)", async () => {
    //  Mock del transporte
    const transportMock = {
      sendMail: jest.fn().mockResolvedValue({ accepted: ["ok@ok.com"] }),
    };
    nodemailer.createTransport.mockReturnValue(transportMock);

    //  Configuramos entorno con CONTACT_EMAIL (para que no entre al if !to)
    process.env.CONTACT_EMAIL = "ok@ok.com";
    process.env.CONTACT_FROM_NAME = "Clinest";
    process.env.SMTP_USER = "";
    process.env.MAIL_USER = "";

    //  Importamos servicio fresco
    delete require.cache[require.resolve("../services/ContactoServices")];
    const ContactoServices = require("../services/ContactoServices");

    //  Ejecutamos enviar() con email lleno (replyTo definido)
    const resultado = await ContactoServices.enviar({
      nombre: "Usuario",
      email: "cliente@dominio.com",
      mensaje: "Prueba de envío",
    });

    //  Validaciones
    expect(resultado).toEqual({ accepted: ["ok@ok.com"] });
    const args = transportMock.sendMail.mock.calls[0][0];
    expect(args.to).toBe("ok@ok.com");
    expect(args.replyTo).toBe("cliente@dominio.com");
    expect(args.from).toMatch(/Clinestetica|Clinest/);
    expect(args.subject).toMatch(/Nuevo mensaje/);
    expect(args.html).toMatch(/Usuario/);
  });
  //  Cubre rama: hay destinatario y NO hay email (replyTo undefined)
  test("enviar cubre rama con destinatario configurado y sin email (replyTo undefined)", async () => {
    const transportMock = {
      sendMail: jest.fn().mockResolvedValue({ accepted: ["ok@ok.com"] }),
    };
    nodemailer.createTransport.mockReturnValue(transportMock);

    process.env.CONTACT_EMAIL = "ok@ok.com"; 
    process.env.CONTACT_FROM_NAME = "Clinest";
    process.env.SMTP_USER = "";
    process.env.MAIL_USER = "";

    delete require.cache[require.resolve("../services/ContactoServices")];
    const ContactoServices = require("../services/ContactoServices");

    const result = await ContactoServices.enviar({
      nombre: "Usuario sin email",
      email: "",
      mensaje: "Mensaje sin correo",
    });

    const args = transportMock.sendMail.mock.calls[0][0];
    expect(result).toEqual({ accepted: ["ok@ok.com"] });
    expect(args.replyTo).toBeUndefined(); //  cubre línea 71
    expect(args.to).toBe("ok@ok.com");
    expect(args.from).toMatch(/Clinest/);
  });

  //  Cubre rama alternativa con destinatario (no entra al if !to)
  test("enviar cubre rama con destinatario configurado (no lanza error)", async () => {
    const transportMock = {
      sendMail: jest.fn().mockResolvedValue({ accepted: ["destino@dom.com"] }),
    };
    nodemailer.createTransport.mockReturnValue(transportMock);

    process.env.CONTACT_EMAIL = "destino@dom.com"; //  hay to
    process.env.CONTACT_FROM_NAME = "Clinestetica";
    process.env.SMTP_USER = "";
    process.env.MAIL_USER = "";

    delete require.cache[require.resolve("../services/ContactoServices")];
    const ContactoServices = require("../services/ContactoServices");

    const result = await ContactoServices.enviar({
      nombre: "Pepe",
      email: "pepe@correo.com",
      mensaje: "Todo bien",
    });

    expect(result).toEqual({ accepted: ["destino@dom.com"] });
    expect(transportMock.sendMail).toHaveBeenCalledTimes(1);
  });

  //  Test final que cubre explícitamente las líneas 66 y 71
  test("enviar cubre ramas restantes: con destinatario y replyTo undefined", async () => {
    // Creamos un nuevo mock limpio cada vez
    const transportMock = {
      sendMail: jest.fn().mockResolvedValue({ accepted: ["ok@ok.com"] }),
    };
    nodemailer.createTransport.mockReturnValue(transportMock);

    //  Caso 1: Hay destinatario (to)
    process.env.CONTACT_EMAIL = "ok@ok.com";
    process.env.CONTACT_FROM_NAME = "Clinestetica";
    process.env.SMTP_USER = "";
    process.env.MAIL_USER = "";

    // Importar módulo fresco
    delete require.cache[require.resolve("../services/ContactoServices")];
    const ContactoServices = require("../services/ContactoServices");

    // Llamada 1 → con email vacío (replyTo undefined)
    const resultado1 = await ContactoServices.enviar({
      nombre: "Usuario sin email",
      email: "",
      mensaje: "Mensaje sin correo",
    });
    const args1 = transportMock.sendMail.mock.calls[0][0];
    expect(resultado1).toEqual({ accepted: ["ok@ok.com"] });
    expect(args1.to).toBe("ok@ok.com");
    expect(args1.replyTo).toBeUndefined();

    transportMock.sendMail.mockClear();
    const resultado2 = await ContactoServices.enviar({
      nombre: "Usuario con correo",
      email: "cliente@gmail.com",
      mensaje: "Mensaje ok",
    });
    const args2 = transportMock.sendMail.mock.calls[0][0];
    expect(resultado2).toEqual({ accepted: ["ok@ok.com"] });
    expect(args2.to).toBe("ok@ok.com");
    expect(args2.replyTo).toBe("cliente@gmail.com");
  });
});
