/*
  Propósito del archivo:
  Pruebas de integración completa (router + controller) para las rutas de Usuarios.

  Cobertura de pruebas:
  - Listar/buscar usuarios: 200 y 404.
  - Pre-registro y confirmación: 200 y 400.
  - Crear usuarios/admin: 201 y validaciones.
  - Editar usuarios: 200/400/404.
  - Eliminar usuarios: 200.
  - Inicio de sesión: 200 (con token) y 401 por credenciales inválidas.
  - Editar estado: 400 (requiere booleano), 200 ok, 401 no encontrado.
  - Notificaciones doctor y usuario: obtener, marcar, marcar todas, archivar e historial 200/400.
*/

const express = require('express');
const request = require('supertest');

const usuariosRouter = require('../routers/UsuariosRouters');

jest.mock('../middleware/Authorization', () => ({
  authorization: (req, res, next) => { req.usuario = { id: 1, rol: 'doctor' }; next(); },
  verificarRol: () => (req, res, next) => next(),
}));

jest.mock('../middleware/Validaciones', () => ({
  validarUsuario: (req, res, next) => next(),
  validarUsuarioPublico: (req, res, next) => next(),
}));

jest.mock('../middleware/intentosfallidos', () => ({
  registrarIntentoFallido: jest.fn(),
  limpiarIntentos: jest.fn(),
  verificarIntentos: (req, res, next) => next(),
}));

jest.mock('../services/UsuariosServices', () => ({
  listarLosUsuarios: jest.fn(async () => [{ id: 1, nombre: 'A' }]),
  buscarLosUsuarios: jest.fn(async (id) => (id === '404' ? null : { id })),
  listarSoloDoctores: jest.fn(async () => [{ id: 2, rol: 'doctor' }]),
  listarSoloUsuarios: jest.fn(async () => [{ id: 3, rol: 'usuario' }]),
  crearLosUsuarios: jest.fn(async (data) => ({ id: 10, ...data })),
  crearLosUsuariosAdmin: jest.fn(async (data) => ({ id: 11, ...data })),
  actualizarLosUsuario: jest.fn(async (id, datos) => [Number(id) !== 404 ? 1 : 0]),
  eliminarLosUsuarios: jest.fn(async () => true),
  iniciarSesion: jest.fn(async (correo, pass) => (correo === 'bad@x.com' ? { error: 'Credenciales incorrectas' } : { token: 't', usuario: { id: 1 } })),
  activarUsuario: jest.fn(async (id, estado) => (id === '999' ? { error: 'Usuario no encontrado' } : { mensaje: 'ok', usuario: { estado } })),
  obtenerNotificacionesDoctor: jest.fn(async () => [{ id: 1 }]),
  obtenerNotificacionesPorUsuario: jest.fn(async () => [{ id: 2 }]),
  marcarNotificacionComoLeida: jest.fn(async () => ({ success: true })),
  marcarTodasNotificacionesComoLeidas: jest.fn(async () => ({ success: true })),
  archivarNotificacionesLeidas: jest.fn(async () => ({ success: true, archivadas: 2 })),
  obtenerHistorialNotificaciones: jest.fn(async () => [{ id: 1 }]),
  marcarNotificacionUsuarioComoLeida: jest.fn(async () => ({ success: true })),
  marcarTodasNotificacionesUsuarioComoLeidas: jest.fn(async () => ({ success: true })),
  archivarNotificacionesLeidasUsuario: jest.fn(async () => ({ success: true, archivadas: 3 })),
  obtenerHistorialNotificacionesUsuario: jest.fn(async () => [{ id: 9 }]),
  preRegistrarUsuario: jest.fn(async (body) => (body.correo ? { success: true } : { error: 'Correo es requerido' })),
  confirmarRegistro: jest.fn(async (correo, codigo) => (codigo === 'bad' ? { success: false, message: 'bad' } : { success: true })),
}));

describe('Routers de Usuarios - integración completa (router + controller)', () => {
  const app = express();
  app.use(express.json());
  app.use('/apiusuarios', usuariosRouter);

  test('GET /listarusuarios -> 200 lista', async () => {
    const res = await request(app).get('/apiusuarios/listarusuarios');
    expect(res.status).toBe(200);
    expect(res.body[0]).toHaveProperty('nombre');
  });

  test('GET /buscarusuarios/:id -> 200 encontrado', async () => {
    const res = await request(app).get('/apiusuarios/buscarusuarios/7');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: '7' });
  });

  test('GET /buscarusuarios/:id -> 404 no encontrado', async () => {
    const res = await request(app).get('/apiusuarios/buscarusuarios/404');
    expect(res.status).toBe(404);
  });

  test('POST /preregistro -> 200 éxito (datos completos y válidos)', async () => {
    const body = {
      nombre: 'Carlos Gomez',
      tipodocumento: 'Cédula de Ciudadanía',
      numerodocumento: '12345678',
      correo: 'carlos@example.com',
      contrasena: 'Segura123',
      telefono: '+573001234567',
      genero: 'Masculino',
      terminos_condiciones: true,
    };
    const res = await request(app).post('/apiusuarios/preregistro').send(body);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  test('POST /preregistro -> 400 error de validación', async () => {
    const res = await request(app).post('/apiusuarios/preregistro').send({});
    expect(res.status).toBe(400);
  });

  test('POST /preregistro/confirmar -> 200 cuando ok', async () => {
    const res = await request(app).post('/apiusuarios/preregistro/confirmar').send({ correo: 'x@x.com', codigo: 'ok' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  test('POST /preregistro/confirmar -> 400 cuando falla verificación', async () => {
    const res = await request(app).post('/apiusuarios/preregistro/confirmar').send({ correo: 'x@x.com', codigo: 'bad' });
    expect(res.status).toBe(400);
  });

  test('POST /crearusuarios -> 201 creado (datos completos y válidos)', async () => {
    const body = {
      nombre: 'Laura Pérez',
      tipodocumento: 'Cédula de Ciudadanía',
      numerodocumento: '87654321',
      correo: 'laura@example.com',
      contrasena: 'ClaveSegura1',
      telefono: '+573221234567',
      genero: 'Femenino',
      terminos_condiciones: true,
    };
    const res = await request(app).post('/apiusuarios/crearusuarios').send(body);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  test('POST /crearusuariosadmin -> 201 creado (datos completos y válidos + rol)', async () => {
    const body = {
      nombre: 'Andrés López',
      tipodocumento: 'Cédula de Ciudadanía',
      numerodocumento: '11223344',
      correo: 'andres@example.com',
      contrasena: 'Contrasena99',
      telefono: '+573051234567',
      genero: 'Masculino',
      terminos_condiciones: true,
      rol: 'usuario',
    };
    const res = await request(app).post('/apiusuarios/crearusuariosadmin').send(body);
    expect(res.status).toBe(201);
  });

  test('PATCH /editarusuarios/:id -> 200 actualizado', async () => {
    const res = await request(app).patch('/apiusuarios/editarusuarios/1').send({ nombre: 'N' });
    expect(res.status).toBe(200);
  });

  test('PATCH /editarusuarios/:id -> 400 id inválido', async () => {
    const res = await request(app).patch('/apiusuarios/editarusuarios/abc').send({});
    expect(res.status).toBe(400);
  });

  test('PATCH /editarusuarios/:id -> 404 no encontrado', async () => {
    const res = await request(app).patch('/apiusuarios/editarusuarios/404').send({});
    expect(res.status).toBe(404);
  });

  test('DELETE /eliminarusuarios/:id -> 200', async () => {
    const res = await request(app).delete('/apiusuarios/eliminarusuarios/1');
    expect(res.status).toBe(200);
  });

  test('POST /iniciarsesion -> 200 con token', async () => {
    const res = await request(app).post('/apiusuarios/iniciarsesion').send({ correo: 'good@x.com', contrasena: '1' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('POST /iniciarsesion -> 401 cuando error', async () => {
    const res = await request(app).post('/apiusuarios/iniciarsesion').send({ correo: 'bad@x.com', contrasena: '1' });
    expect(res.status).toBe(401);
  });

  test('PATCH /editarestadousuario/:id -> 400 requiere booleano', async () => {
    const res = await request(app).patch('/apiusuarios/editarestadousuario/1').send({ estado: 'x' });
    expect(res.status).toBe(400);
  });

  test('PATCH /editarestadousuario/:id -> 200 ok', async () => {
    const res = await request(app).patch('/apiusuarios/editarestadousuario/1').send({ estado: true });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('mensaje');
  });

  test('PATCH /editarestadousuario/:id -> 401 no encontrado', async () => {
    const res = await request(app).patch('/apiusuarios/editarestadousuario/999').send({ estado: true });
    expect(res.status).toBe(401);
  });

  test('GET /notificaciones/:id -> 200 lista', async () => {
    const res = await request(app).get('/apiusuarios/notificaciones/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1 }]);
  });

  test('PATCH /notificaciones/:id/marcar-leida -> 200', async () => {
    const res = await request(app).patch('/apiusuarios/notificaciones/1/marcar-leida').send({ notificacionId: 1 });
    expect(res.status).toBe(200);
  });

  test('PATCH /notificaciones/:id/marcar-leida -> 400 cuando falta id', async () => {
    const res = await request(app).patch('/apiusuarios/notificaciones/1/marcar-leida').send({});
    expect(res.status).toBe(400);
  });

  test('PATCH /notificaciones/:id/marcar-todas-leidas -> 200', async () => {
    const res = await request(app).patch('/apiusuarios/notificaciones/1/marcar-todas-leidas').send({});
    expect(res.status).toBe(200);
  });

  test('PATCH /notificaciones/:id/archivar-leidas -> 200', async () => {
    const res = await request(app).patch('/apiusuarios/notificaciones/1/archivar-leidas').send({});
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('archivadas', 2);
  });

  test('GET /notificaciones/:id/historial -> 200', async () => {
    const res = await request(app).get('/apiusuarios/notificaciones/1/historial');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1 }]);
  });

  // Usuario notifications
  test('GET /notificacionesusuario/:id -> 200 lista', async () => {
    const res = await request(app).get('/apiusuarios/notificacionesusuario/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 2 }]);
  });

  test('PATCH /notificacionesusuario/:id/marcar-leida -> 200', async () => {
    const res = await request(app).patch('/apiusuarios/notificacionesusuario/1/marcar-leida').send({ notificacionId: 1 });
    expect(res.status).toBe(200);
  });

  test('PATCH /notificacionesusuario/:id/marcar-leida -> 400 falta id', async () => {
    const res = await request(app).patch('/apiusuarios/notificacionesusuario/1/marcar-leida').send({});
    expect(res.status).toBe(400);
  });

  test('PATCH /notificacionesusuario/:id/marcar-todas-leidas -> 200', async () => {
    const res = await request(app).patch('/apiusuarios/notificacionesusuario/1/marcar-todas-leidas').send({});
    expect(res.status).toBe(200);
  });

  test('PATCH /notificacionesusuario/:id/archivar-leidas -> 200', async () => {
    const res = await request(app).patch('/apiusuarios/notificacionesusuario/1/archivar-leidas').send({});
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('archivadas', 3);
  });

  test('GET /notificacionesusuario/:id/historial -> 200', async () => {
    const res = await request(app).get('/apiusuarios/notificacionesusuario/1/historial');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 9 }]);
  });
});
