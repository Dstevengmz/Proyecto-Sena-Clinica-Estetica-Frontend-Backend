jest.mock("nodemailer", () => ({ createTransport: jest.fn() }));
jest.mock("bcryptjs", () => ({ compare: jest.fn(), hash: jest.fn() }));
jest.mock("../models", () => ({
  usuarios: { findByPk: jest.fn(), findOne: jest.fn() },
}));

const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const models = require("../models");

const FIXED_TOKEN_HEX = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
jest.mock("crypto", () => ({
  randomBytes: jest.fn(() =>
    Buffer.from("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "hex")
  ),
}));
const crypto = require("crypto");

describe("CambiarContrasenaServices", () => {
  let svc;
  const realDateNow = Date.now.bind(Date);
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EMAIL_USER = "sender@gmail.com";
    process.env.EMAIL_PASS = "pass";
    process.env.FRONTEND_URL = "https://app.gmail.com";

    const transportMock = {
      sendMail: jest.fn().mockResolvedValue({ accepted: ["user@gmail.com"] }),
    };
    nodemailer.createTransport.mockReturnValue(transportMock);

    svc = require("../services/CambiarContrasenaServices");
  });

  afterEach(() => {
    Date.now = realDateNow;
  });

  test("cambiarcontrasena -> error si usuario no existe", async () => {
    models.usuarios.findByPk.mockResolvedValue(null);
    await expect(svc.cambiarcontrasena(1, "old", "newpass")).rejects.toThrow(
      /Usuario no encontrado/
    );
  });

  test("cambiarcontrasena -> error si actual incorrecta", async () => {
    models.usuarios.findByPk.mockResolvedValue({ id: 1, contrasena: "hash" });
    bcrypt.compare.mockResolvedValueOnce(false); 
    await expect(svc.cambiarcontrasena(1, "bad", "newpass")).rejects.toThrow(
      /actual es incorrecta/
    );
  });

  test("cambiarcontrasena -> error si nueva muy corta", async () => {
    models.usuarios.findByPk.mockResolvedValue({ id: 1, contrasena: "hash" });
    bcrypt.compare.mockResolvedValueOnce(true); 
    await expect(svc.cambiarcontrasena(1, "old", "123")).rejects.toThrow(
      /al menos 6/
    );
  });

  test("cambiarcontrasena -> error si nueva igual a actual", async () => {
    const usuario = { id: 1, contrasena: "hash" };
    models.usuarios.findByPk.mockResolvedValue(usuario);
    bcrypt.compare.mockResolvedValueOnce(true).mockResolvedValueOnce(true);
    await expect(svc.cambiarcontrasena(1, "old", "samepass")).rejects.toThrow(
      /no puede ser igual/
    );
  });

  test("cambiarcontrasena -> actualiza y guarda", async () => {
    const save = jest.fn();
    const usuario = { id: 1, contrasena: "oldhash", save };
    models.usuarios.findByPk.mockResolvedValue(usuario);
    bcrypt.compare.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    bcrypt.hash.mockResolvedValue("newhash");
    const res = await svc.cambiarcontrasena(1, "old", "newpass");
    expect(usuario.contrasena).toBe("newhash");
    expect(save).toHaveBeenCalled();
    expect(res).toEqual({ message: expect.stringMatching(/actualizada/i) });
  });

  
  test("solicitarReset -> error si correo no registrado", async () => {
    models.usuarios.findOne.mockResolvedValue(null);
    await expect(svc.solicitarReset("no@site.com")).rejects.toThrow(
      /Correo no registrado/
    );
  });

  test("solicitarReset -> envía correo con link y token fijo", async () => {
    models.usuarios.findOne.mockResolvedValue({ id: 9, correo: "u@site.com" });
    const baseTime = 1_000_000;
    Date.now = jest.fn(() => baseTime);
    const res = await svc.solicitarReset("u@site.com");
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: "gmail",
      auth: { user: "sender@gmail.com", pass: "pass" },
    });
    const sendArgs =
      nodemailer.createTransport.mock.results[0].value.sendMail.mock
        .calls[0][0];
    expect(sendArgs.to).toBe("u@site.com");
    expect(sendArgs.html).toMatch(
      new RegExp(
        `${process.env.FRONTEND_URL}/resetearcontrasena/${FIXED_TOKEN_HEX}`
      )
    );
    expect(res).toEqual({ message: expect.stringMatching(/Correo enviado/) });
  });

  test("resetearPassword -> error token inválido", async () => {
    await expect(svc.resetearPassword("deadbeef", "newpass")).rejects.toThrow(
      /Token inválido/
    );
  });

  test("resetearPassword -> expirado si tiempo pasó", async () => {
    models.usuarios.findOne.mockResolvedValue({ id: 2, correo: "x@site.com" });
    Date.now = jest.fn(() => 2_000_000);
    await svc.solicitarReset("x@site.com");
    Date.now = jest.fn(() => 2_000_000 + 3_600_000 + 10);
    await expect(
      svc.resetearPassword(FIXED_TOKEN_HEX, "newpass")
    ).rejects.toThrow(/Token inválido/);
  });

  test("resetearPassword -> actualiza, guarda y borra token", async () => {
    const save = jest.fn();
    models.usuarios.findOne.mockResolvedValue({ id: 5, correo: "z@site.com" });
    Date.now = jest.fn(() => 3_000_000);
    await svc.solicitarReset("z@site.com");

    models.usuarios.findByPk.mockResolvedValue({ id: 5, save });
    bcrypt.hash.mockResolvedValue("hashed");
    const r = await svc.resetearPassword(FIXED_TOKEN_HEX, "newpass");
    expect(save).toHaveBeenCalled();
    expect(r).toEqual({ message: expect.stringMatching(/restablecida/) });

    await expect(
      svc.resetearPassword(FIXED_TOKEN_HEX, "another")
    ).rejects.toThrow(/Token inválido/);
  });
  
  test("resetearPassword -> lanza error si nueva contraseña es muy corta", async () => {
    models.usuarios.findOne.mockResolvedValue({
      id: 10,
      correo: "test@site.com",
    });
    Date.now = jest.fn(() => 4_000_000);
    await svc.solicitarReset("test@site.com");

    await expect(svc.resetearPassword(FIXED_TOKEN_HEX, "123")).rejects.toThrow(
      /al menos 6/
    );
  });

  test("resetearPassword -> lanza error si usuario no existe", async () => {
    models.usuarios.findOne.mockResolvedValue({
      id: 88,
      correo: "ghost@site.com",
    });
    Date.now = jest.fn(() => 8_000_000);
    await svc.solicitarReset("ghost@site.com");

    models.usuarios.findByPk.mockResolvedValue(null);

    await expect(
      svc.resetearPassword(FIXED_TOKEN_HEX, "newpass123")
    ).rejects.toThrow(/Usuario no encontrado/);
  });
});
