/*
  Propósito del archivo:
  Pruebas rápidas de integración del router de Usuarios montado en una app Express
  para validar endpoints básicos y middleware de autorización simulado.

  Cobertura de pruebas:
  - GET /listarusuarios -> 200 lista.
  - GET /perfil -> 200 con usuario del middleware.
*/

const express = require('express');
const request = require('supertest');

// Montamos solo el router de usuarios para una prueba de smoke
const usuariosRouter = require('../routers/UsuariosRouters');

// Mockear middlewares de auth para que dejen pasar
jest.mock('../middleware/Authorization', () => ({
  authorization: (req, res, next) => { req.usuario = { id: 1, rol: 'doctor' }; next(); },
  verificarRol: () => (req, res, next) => next(),
}));

// Mockear controlador: por defecto devuelve 200 OK, y para algunas rutas respuestas específicas
jest.mock('../controllers/UsuariosControllers', () => {
  const defaultHandler = (req, res) => res.status(200).json({ ok: true });
  return new Proxy(
    {
      listarUsuarios: (req, res) => res.json([{ id: 1, nombre: 'Test' }]),
      perfilUsuario: (req, res) => res.json({ usuario: { id: req.usuario.id } }),
      iniciarSesion: (req, res) => res.json({ token: 'fake' }),
    },
    {
      get(target, prop) {
        if (prop in target) return target[prop];
        return defaultHandler;
      },
    }
  );
});

describe('Routers de Usuarios - integración básica (app Express)', () => {
  const app = express();
  app.use(express.json());
  app.use('/apiusuarios', usuariosRouter);

  it('GET /apiusuarios/listarusuarios devuelve lista', async () => {
    const res = await request(app).get('/apiusuarios/listarusuarios');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, nombre: 'Test' }]);
  });

  it('GET /apiusuarios/perfil devuelve usuario del middleware', async () => {
    const res = await request(app).get('/apiusuarios/perfil');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ usuario: { id: 1 } });
  });
});
