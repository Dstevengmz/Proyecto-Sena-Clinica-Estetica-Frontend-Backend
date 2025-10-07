/*
  Propósito del archivo:
  Validar el funcionamiento del Controlador de Usuarios: registro/prerregistro, confirmación,
  inicio de sesión, perfil, edición/eliminación, activación y notificaciones.

  Cobertura de pruebas:
  - Listar y buscar usuarios: 200, 404 y manejo 500.
  - Listar doctores/usuarios: 200 y 500.
  - Crear usuarios/admin: 201 y 500.
  - Pre-registro y confirmación: 200/400, 500.
  - Perfil y actualización: 200/404/400/500.
  - Eliminación: 200.
  - Inicio de sesión: 401, 200 y 500 (+ intentos fallidos).
  - Activación de usuario: 400/401/200/500.
  - Notificaciones (doctor y usuario): obtener, marcar, archivar e historial con 200/400/500.
*/

jest.mock('../services/UsuariosServices', () => ({
  listarLosUsuarios: jest.fn(),
  buscarLosUsuarios: jest.fn(),
  listarSoloDoctores: jest.fn(),
  listarSoloUsuarios: jest.fn(),
  crearLosUsuarios: jest.fn(),
  preRegistrarUsuario: jest.fn(),
  confirmarRegistro: jest.fn(),
  crearLosUsuariosAdmin: jest.fn(),
  actualizarLosUsuario: jest.fn(),
  eliminarLosUsuarios: jest.fn(),
  iniciarSesion: jest.fn(),
  activarUsuario: jest.fn(),
  obtenerNotificacionesDoctor: jest.fn(),
  obtenerNotificacionesPorUsuario: jest.fn(),
  marcarNotificacionComoLeida: jest.fn(),
  marcarTodasNotificacionesComoLeidas: jest.fn(),
  archivarNotificacionesLeidas: jest.fn(),
  obtenerHistorialNotificaciones: jest.fn(),
  marcarNotificacionUsuarioComoLeida: jest.fn(),
  marcarTodasNotificacionesUsuarioComoLeidas: jest.fn(),
  archivarNotificacionesLeidasUsuario: jest.fn(),
  obtenerHistorialNotificacionesUsuario: jest.fn(),
}));

jest.mock('../middleware/intentosfallidos', () => ({
  registrarIntentoFallido: jest.fn(),
  limpiarIntentos: jest.fn(),
}));

const svc = require('../services/UsuariosServices');
const { registrarIntentoFallido, limpiarIntentos } = require('../middleware/intentosfallidos');
const controller = require('../controllers/UsuariosControllers');

const mockReqRes = (overrides = {}) => {
  const req = { body: {}, params: {}, usuario: { id: 1, rol: 'usuario' }, ...overrides };
  const res = { statusCode: 200, body: undefined, status(c){this.statusCode=c;return this;}, json(p){this.body=p;return this;} };
  return { req, res };
};

describe('Controlador de Usuarios', () => {
  beforeEach(() => jest.clearAllMocks());

  test('listarUsuarios -> 200', async () => {
    svc.listarLosUsuarios.mockResolvedValue([{ id: 1 }]);
    const { req, res } = mockReqRes();
    await controller.listarUsuarios(req, res);
    expect(res.statusCode).toBe(200);
  });

  test('buscarUsuarios -> 200 y 404', async () => {
    svc.buscarLosUsuarios.mockResolvedValue({ id: 2 });
    let ctx = mockReqRes({ params: { id: 2 } });
    await controller.buscarUsuarios(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    svc.buscarLosUsuarios.mockResolvedValue(null);
    ctx = mockReqRes({ params: { id: 2 } });
    await controller.buscarUsuarios(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(404);
  });

  test('listarDoctores/listarSoloUsuarios -> 200 y 500', async () => {
    svc.listarSoloDoctores.mockResolvedValue([{ id: 1 }]);
    let ctx = mockReqRes();
    await controller.listarDoctores(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    svc.listarSoloDoctores.mockRejectedValue(new Error('x'));
    ctx = mockReqRes();
    await controller.listarDoctores(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);

    svc.listarSoloUsuarios.mockResolvedValue([{ id: 1 }]);
    ctx = mockReqRes();
    await controller.listarSoloUsuarios(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    svc.listarSoloUsuarios.mockRejectedValue(new Error('x'));
    ctx = mockReqRes();
    await controller.listarSoloUsuarios(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test('crearUsuarios -> 201 y 500', async () => {
    svc.crearLosUsuarios.mockResolvedValue({ id: 1 });
    let ctx = mockReqRes({ body: { nombre: 'a' } });
    await controller.crearUsuarios(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(201);
    svc.crearLosUsuarios.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ body: { nombre: 'a' } });
    await controller.crearUsuarios(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test('preRegistro -> 200 ok y 400 por error de servicio', async () => {
    svc.preRegistrarUsuario.mockResolvedValue({ success: true });
    let ctx = mockReqRes({ body: { correo: 'a@b.c' } });
    await controller.preRegistro(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    svc.preRegistrarUsuario.mockResolvedValue({ error: 'bad' });
    ctx = mockReqRes({ body: { correo: 'a@b.c' } });
    await controller.preRegistro(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(400);
  });

  test('confirmarRegistro -> 200 ok, 400 por error y 500 por excepción', async () => {
    svc.confirmarRegistro.mockResolvedValue({ success: true });
    let ctx = mockReqRes({ body: { correo: 'a', codigo: '123' } });
    await controller.confirmarRegistro(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    svc.confirmarRegistro.mockResolvedValue({ success: false, error: 'bad' });
    ctx = mockReqRes({ body: { correo: 'a', codigo: '123' } });
    await controller.confirmarRegistro(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(400);
    svc.confirmarRegistro.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ body: { correo: 'a', codigo: '123' } });
    await controller.confirmarRegistro(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test('crearUsuariosAdmin -> 201 y 500', async () => {
    svc.crearLosUsuariosAdmin.mockResolvedValue({ id: 1 });
    let ctx = mockReqRes({ body: { nombre: 'admin' } });
    await controller.crearUsuariosAdmin(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(201);
    svc.crearLosUsuariosAdmin.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ body: { nombre: 'admin' } });
    await controller.crearUsuariosAdmin(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test('perfilUsuario -> 200 y 404', async () => {
    svc.buscarLosUsuarios.mockResolvedValue({ id: 1 });
    let ctx = mockReqRes({ usuario: { id: 9 } });
    await controller.perfilUsuario(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    svc.buscarLosUsuarios.mockResolvedValue(null);
    ctx = mockReqRes({ usuario: { id: 9 } });
    await controller.perfilUsuario(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(404);
  });

  test('actualizarUsuario -> 400 inválido, 404 no encontrado, 200 ok y 500 error', async () => {
    let ctx = mockReqRes({ params: { id: 'abc' }, body: {} });
    await controller.actualizarUsuario(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(400);
    svc.actualizarLosUsuario.mockResolvedValue([0]);
    ctx = mockReqRes({ params: { id: '7' }, body: {} });
    await controller.actualizarUsuario(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(404);
    svc.actualizarLosUsuario.mockResolvedValue([1]);
    ctx = mockReqRes({ params: { id: '7' }, body: {} });
    await controller.actualizarUsuario(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    svc.actualizarLosUsuario.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ params: { id: '7' }, body: {} });
    await controller.actualizarUsuario(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test('eliminarUsuarios -> 200', async () => {
    const { req, res } = mockReqRes({ params: { id: 1 } });
    await controller.eliminarUsuarios(req, res);
    expect(res.statusCode).toBe(200);
    expect(svc.eliminarLosUsuarios).toHaveBeenCalledWith(1);
  });

  test('iniciarSesion -> 401 error, 200 ok y 500 excepción', async () => {
    svc.iniciarSesion.mockResolvedValue({ error: 'bad' });
    let ctx = mockReqRes({ body: { correo: 'a', contrasena: 'b' } });
    await controller.iniciarSesion(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(401);
    expect(registrarIntentoFallido).toHaveBeenCalled();
    svc.iniciarSesion.mockResolvedValue({ token: 't' });
    ctx = mockReqRes({ body: { correo: 'a', contrasena: 'b' } });
    await controller.iniciarSesion(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    expect(limpiarIntentos).toHaveBeenCalled();
    svc.iniciarSesion.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ body: { correo: 'a', contrasena: 'b' } });
    await controller.iniciarSesion(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test('activacionUsario -> 400 estado inválido, 401 error servicio, 200 ok y 500 excepción', async () => {
    let ctx = mockReqRes({ params: { id: 1 }, body: { estado: 'no-bool' } });
    await controller.activacionUsario(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(400);
    svc.activarUsuario.mockResolvedValue({ error: 'bad' });
    ctx = mockReqRes({ params: { id: 1 }, body: { estado: true } });
    await controller.activacionUsario(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(401);
    svc.activarUsuario.mockResolvedValue({ usuario: { estado: true } });
    ctx = mockReqRes({ params: { id: 1 }, body: { estado: false } });
    await controller.activacionUsario(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    svc.activarUsuario.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ params: { id: 1 }, body: { estado: true } });
    await controller.activacionUsario(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test('notificaciones doctor/usuario -> 200 y 500', async () => {
    svc.obtenerNotificacionesDoctor.mockResolvedValue([]);
    let ctx = mockReqRes({ params: { id: 1 } });
    await controller.obtenerNotificaciones(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    svc.obtenerNotificacionesDoctor.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ params: { id: 1 } });
    await controller.obtenerNotificaciones(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);

    svc.obtenerNotificacionesPorUsuario.mockResolvedValue([]);
    ctx = mockReqRes({ params: { id: 1 } });
    await controller.obtenerNotificacionesUsuario(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    svc.obtenerNotificacionesPorUsuario.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ params: { id: 1 } });
    await controller.obtenerNotificacionesUsuario(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test('marcarNotificacionComoLeida y todas -> validaciones, 200 ok, 400 error, 500 excepción', async () => {
    let ctx = mockReqRes({ params: { id: 1 }, body: {} });
    await controller.marcarNotificacionComoLeida(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(400);
    svc.marcarNotificacionComoLeida.mockResolvedValue({ success: true });
    ctx = mockReqRes({ params: { id: 1 }, body: { notificacionId: 9 } });
    await controller.marcarNotificacionComoLeida(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    svc.marcarNotificacionComoLeida.mockResolvedValue({ success: false, error: 'bad' });
    ctx = mockReqRes({ params: { id: 1 }, body: { notificacionId: 9 } });
    await controller.marcarNotificacionComoLeida(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(400);
    svc.marcarNotificacionComoLeida.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ params: { id: 1 }, body: { notificacionId: 9 } });
    await controller.marcarNotificacionComoLeida(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);

    svc.marcarTodasNotificacionesComoLeidas.mockResolvedValue({ success: true });
    ctx = mockReqRes({ params: { id: 1 } });
    await controller.marcarTodasNotificacionesComoLeidas(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    svc.marcarTodasNotificacionesComoLeidas.mockResolvedValue({ success: false, error: 'bad' });
    ctx = mockReqRes({ params: { id: 1 } });
    await controller.marcarTodasNotificacionesComoLeidas(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(400);
    svc.marcarTodasNotificacionesComoLeidas.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ params: { id: 1 } });
    await controller.marcarTodasNotificacionesComoLeidas(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test('archivar / historial notificaciones doctor -> 200 ok y 500', async () => {
    svc.archivarNotificacionesLeidas.mockResolvedValue({ success: true, archivadas: [], activas: [] });
    let ctx = mockReqRes({ params: { id: 1 } });
    await controller.archivarNotificacionesLeidas(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    svc.archivarNotificacionesLeidas.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ params: { id: 1 } });
    await controller.archivarNotificacionesLeidas(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);

    svc.obtenerHistorialNotificaciones.mockResolvedValue([]);
    ctx = mockReqRes({ params: { id: 1 } });
    await controller.obtenerHistorialNotificaciones(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    svc.obtenerHistorialNotificaciones.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ params: { id: 1 } });
    await controller.obtenerHistorialNotificaciones(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test('notificaciones usuario endpoints -> 200/400/500', async () => {
    // marcarNotificacionUsuarioComoLeida
    let ctx = mockReqRes({ params: { id: 1 }, body: {} });
    await controller.marcarNotificacionUsuarioComoLeida(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(400);
    svc.marcarNotificacionUsuarioComoLeida.mockResolvedValue({ success: true });
    ctx = mockReqRes({ params: { id: 1 }, body: { notificacionId: 2 } });
    await controller.marcarNotificacionUsuarioComoLeida(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    svc.marcarNotificacionUsuarioComoLeida.mockResolvedValue({ success: false, error: 'bad' });
    ctx = mockReqRes({ params: { id: 1 }, body: { notificacionId: 2 } });
    await controller.marcarNotificacionUsuarioComoLeida(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(400);
    svc.marcarNotificacionUsuarioComoLeida.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ params: { id: 1 }, body: { notificacionId: 2 } });
    await controller.marcarNotificacionUsuarioComoLeida(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);

    // marcarTodasNotificacionesUsuarioComoLeidas
    svc.marcarTodasNotificacionesUsuarioComoLeidas.mockResolvedValue({ success: true });
    ctx = mockReqRes({ params: { id: 1 } });
    await controller.marcarTodasNotificacionesUsuarioComoLeidas(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    svc.marcarTodasNotificacionesUsuarioComoLeidas.mockResolvedValue({ success: false, error: 'bad' });
    ctx = mockReqRes({ params: { id: 1 } });
    await controller.marcarTodasNotificacionesUsuarioComoLeidas(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(400);
    svc.marcarTodasNotificacionesUsuarioComoLeidas.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ params: { id: 1 } });
    await controller.marcarTodasNotificacionesUsuarioComoLeidas(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);

    // archivarNotificacionesLeidasUsuario
    svc.archivarNotificacionesLeidasUsuario.mockResolvedValue({ success: true, archivadas: [], activas: [] });
    ctx = mockReqRes({ params: { id: 1 } });
    await controller.archivarNotificacionesLeidasUsuario(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    svc.archivarNotificacionesLeidasUsuario.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ params: { id: 1 } });
    await controller.archivarNotificacionesLeidasUsuario(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);

    // obtenerHistorialNotificacionesUsuario
    svc.obtenerHistorialNotificacionesUsuario.mockResolvedValue([]);
    ctx = mockReqRes({ params: { id: 1 } });
    await controller.obtenerHistorialNotificacionesUsuario(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    svc.obtenerHistorialNotificacionesUsuario.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ params: { id: 1 } });
    await controller.obtenerHistorialNotificacionesUsuario(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });
});
