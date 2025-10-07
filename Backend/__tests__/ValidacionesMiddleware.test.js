/*
  Propósito del archivo:
  Pruebas unitarias para los middlewares de validación de usuarios (Validaciones): verifican reglas de campos requeridos y formatos.

  Cobertura de pruebas:
  - validarUsuario: 400 si faltan campos o términos/condiciones inválidos; 200 cuando todo es válido.
  - validarUsuarioPublico: 200 cuando el payload es válido sin rol; 400 con correo inválido o documento no numérico.
*/

const request = require('supertest');
const express = require('express');
const { validarUsuario, validarUsuarioPublico } = require('../middleware/Validaciones');

// Helper para montar un endpoint con middlewares + handler final
const mount = (middlewares) => {
  const app = express();
  app.use(express.json());
  app.post('/x', ...middlewares, (req, res) => res.json({ ok: true }));
  return app;
};

const basePayload = {
  nombre: 'Pedro Perez',
  tipodocumento: 'CC',
  numerodocumento: '1234567',
  correo: 'a@b.com',
  contrasena: 'secret1',
  telefono: '+57 3000000000',
  genero: 'M',
  terminos_condiciones: true,
};

describe('Middlewares de Validaciones (usuarios)', () => {
  test('validarUsuario -> 400 si faltan campos', async () => {
    const app = mount([validarUsuario]);
    const res = await request(app).post('/x').send({});
    expect(res.status).toBe(400);
    expect(res.body.errores?.length).toBeGreaterThan(0);
  });

  test('validarUsuario -> 400 si términos es false/string false', async () => {
    const app = mount([validarUsuario]);
    const res = await request(app).post('/x').send({ ...basePayload, rol: 'usuario', terminos_condiciones: 'false' });
    expect(res.status).toBe(400);
  });

  test('validarUsuario -> 200 cuando todo es válido', async () => {
    const app = mount([validarUsuario]);
    const res = await request(app).post('/x').send({ ...basePayload, rol: 'usuario' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test('validarUsuarioPublico -> 200 sin rol si válido', async () => {
    const app = mount([validarUsuarioPublico]);
    const res = await request(app).post('/x').send({ ...basePayload });
    expect(res.status).toBe(200);
  });

  test('validarUsuarioPublico -> 400 con correo inválido y doc no numérico', async () => {
    const app = mount([validarUsuarioPublico]);
    const res = await request(app).post('/x').send({
      ...basePayload,
      correo: 'mal-correo',
      numerodocumento: 'abc',
    });
    expect(res.status).toBe(400);
    expect(res.body.errores?.length).toBeGreaterThan(0);
  });
});
