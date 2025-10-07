jest.mock('../models', () => ({
  usuarios: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  notificaciones: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('jsonwebtoken', () => ({ sign: jest.fn(() => 'jwt-token') }));
jest.mock('bcrypt', () => ({
  hash: jest.fn(async (s) => `hashed:${s}`),
  compare: jest.fn(async (a,b) => a === b),
}));
jest.mock('../assets/corre', () => ({ EnviarCorreo: jest.fn(async () => true) }));
jest.mock('../config/redis', () => ({
  get: jest.fn(async () => null),
  setEx: jest.fn(async () => {}),
  del: jest.fn(async () => {}),
  incr: jest.fn(async () => 1),
  expire: jest.fn(async () => {}),
  lRange: jest.fn(async () => []),
  lPush: jest.fn(async () => {}),
}));

/*
  Propósito del archivo:
  Validar la capa de Servicios de Usuarios: creación, inicio de sesión, activación,
  actualización/eliminación y todo el flujo de prerregistro/confirmación y notificaciones.

  Cobertura de pruebas:
  - CRUD base (listar/buscar/crear/actualizar/eliminar): delegación al modelo, casos felices y errores.
  - Inicio de sesión: token OK, errores por correo/estado/contraseña, manejo de excepción.
  - Activación: actualización de estado, no encontrado y errores.
  - Pre-registro: validaciones, guardado en Redis y envío de código; confirmación (éxito y fallos).
  - Notificaciones doctor/usuario: obtener, marcar una/todas, archivar e historial (incluye Redis y BD).
*/

describe('Servicios de Usuarios', () => {
  let svc;
  let models;
  const corre = require('../assets/corre');
  const redis = require('../config/redis');
  const bcrypt = require('bcrypt');
  const jwt = require('jsonwebtoken');

  beforeEach(() => {
    jest.clearAllMocks();
    models = require('../models');
    svc = require('../services/UsuariosServices');
    process.env.JWT_SECRET = 'secret';
    // Safe defaults to avoid leakage from previous tests overriding implementations
    if (models?.usuarios?.findOne?.mockResolvedValue) {
      models.usuarios.findOne.mockResolvedValue(null);
    }
    if (models?.notificaciones?.update?.mockResolvedValue) {
      models.notificaciones.update.mockResolvedValue([0]);
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('listarLosUsuarios delega a modelo', async () => {
    models.usuarios.findAll.mockResolvedValue([{ id: 1 }]);
    const res = await svc.listarLosUsuarios();
    expect(models.usuarios.findAll).toHaveBeenCalled();
    expect(res).toEqual([{ id: 1 }]);
  });

  test('crearLosUsuarios hashea contraseña y envía correo', async () => {
    models.usuarios.create.mockResolvedValue({ id: 2, nombre: 'Juan' });
    const res = await svc.crearLosUsuarios({ nombre: ' juan ', correo: 'x@y.com', contrasena: '123' });
    expect(models.usuarios.create).toHaveBeenCalledWith(expect.objectContaining({
      nombre: expect.any(String),
      contrasena: 'hashed:123',
    }));
    expect(corre.EnviarCorreo).toHaveBeenCalled();
    expect(res).toEqual({ id: 2, nombre: 'Juan' });
  });

  test('iniciarSesion feliz retorna token y usuario', async () => {
    models.usuarios.findOne.mockResolvedValue({
      id: 1, correo: 'a@a.com', contrasena: 'abc', rol: 'usuario', estado: true, nombre: 'Ana'
    });
  // bcrypt.compare simulado: devuelve true solo cuando los argumentos son exactamente iguales
    bcrypt.compare.mockResolvedValue(true);
    const res = await svc.iniciarSesion('a@a.com', 'abc');
    expect(jwt.sign).toHaveBeenCalledWith({ id: 1, correo: 'a@a.com', rol: 'usuario' }, 'secret', { expiresIn: '3h' });
    expect(res).toHaveProperty('token', 'jwt-token');
    expect(res).toHaveProperty('usuario');
  });

  test('iniciarSesion falla por correo no registrado', async () => {
    models.usuarios.findOne.mockResolvedValue(null);
    const res = await svc.iniciarSesion('x@x.com', 'p');
    expect(res).toEqual({ error: 'Correo no registrado' });
  });

  test('iniciarSesion falla por usuario inactivo', async () => {
    models.usuarios.findOne.mockResolvedValue({ estado: false });
    const res = await svc.iniciarSesion('x@x.com', 'p');
    expect(res).toEqual({ error: 'Usuario inactivo, por favor contactese con soporte' });
  });

  test('iniciarSesion falla por contraseña incorrecta', async () => {
    models.usuarios.findOne.mockResolvedValue({ correo: 'x@x.com', contrasena: 'hash', estado: true });
    bcrypt.compare.mockResolvedValue(false);
    const res = await svc.iniciarSesion('x@x.com', 'bad');
    expect(res).toEqual({ error: 'Credenciales incorrectas' });
  });

  test('activarUsuario actualiza estado y devuelve mensaje', async () => {
    const save = jest.fn(async () => {});
    models.usuarios.findByPk.mockResolvedValue({ estado: false, save });
    const res = await svc.activarUsuario(1, true);
    expect(save).toHaveBeenCalled();
    expect(res).toHaveProperty('mensaje');
    expect(res.usuario.estado).toBe(true);
  });

  test('preRegistrarUsuario valida correo y contraseña y guarda en Redis y envía código', async () => {
    models.usuarios.findOne.mockResolvedValue(null);
    const result = await svc.preRegistrarUsuario({ correo: 'p@p.com', contrasena: '123', nombre: ' Pedro ' });
    expect(redis.setEx).toHaveBeenCalled();
    expect(result).toHaveProperty('success', true);
  });

  test('confirmarRegistro feliz crea usuario y limpia Redis', async () => {
  // verificarCodigo con éxito
    jest.spyOn(svc, 'verificarCodigo').mockResolvedValue({ success: true });
    const payload = { nombre: 'Ana', correo: 'a@a.com', contrasena: 'hashed:pw', rol: 'usuario' };
    const redisMock = require('../config/redis');
    redisMock.get.mockResolvedValue(JSON.stringify(payload));
    models.usuarios.findOne.mockResolvedValue(null);
    models.usuarios.create.mockResolvedValue({ id: 10, nombre: 'Ana' });

    const res = await svc.confirmarRegistro('a@a.com', '000000');
    expect(models.usuarios.create).toHaveBeenCalledWith(expect.objectContaining({ correo: 'a@a.com' }));
    expect(redis.del).toHaveBeenCalled();
    expect(res).toHaveProperty('success', true);
  });

  test('listarSoloDoctores usa filtro y atributos', async () => {
    models.usuarios.findAll.mockResolvedValue([{ id: 1 }]);
    const res = await svc.listarSoloDoctores();
    expect(models.usuarios.findAll).toHaveBeenCalledWith({
      where: { rol: 'doctor', estado: true },
      attributes: ['id', 'nombre', 'correo'],
    });
    expect(res).toEqual([{ id: 1 }]);
  });

  test('listarSoloUsuarios usa filtro y atributos', async () => {
    models.usuarios.findAll.mockResolvedValue([{ id: 2 }]);
    const res = await svc.listarSoloUsuarios();
    expect(models.usuarios.findAll).toHaveBeenCalledWith({
      where: { rol: 'usuario', estado: true },
      attributes: [
        'id',
        'nombre',
        'tipodocumento',
        'numerodocumento',
        'correo',
        'rol',
        'estado',
        'genero',
      ],
    });
    expect(res).toEqual([{ id: 2 }]);
  });

  test('buscarLosUsuarios por PK', async () => {
    models.usuarios.findByPk.mockResolvedValue({ id: 7 });
    const res = await svc.buscarLosUsuarios(7);
    expect(models.usuarios.findByPk).toHaveBeenCalledWith(7);
    expect(res).toEqual({ id: 7 });
  });

  test('crearLosUsuariosAdmin hashea y envía correo', async () => {
    models.usuarios.create.mockResolvedValue({ id: 3, nombre: 'Admin' });
    const res = await svc.crearLosUsuariosAdmin({ nombre: ' admin ', correo: 'admin@a.com', contrasena: 'pwd' });
    expect(models.usuarios.create).toHaveBeenCalledWith(expect.objectContaining({ contrasena: 'hashed:pwd' }));
    expect(corre.EnviarCorreo).toHaveBeenCalled();
    expect(res).toEqual({ id: 3, nombre: 'Admin' });
  });

  test('eliminarLosUsuarios destruye cuando existe', async () => {
    const destroy = jest.fn(async () => 'ok');
    models.usuarios.findByPk.mockResolvedValue({ id: 9, destroy });
    const res = await svc.eliminarLosUsuarios(9);
    expect(destroy).toHaveBeenCalled();
    expect(res).toBe('ok');
  });

  test('eliminarLosUsuarios retorna null cuando no existe', async () => {
    models.usuarios.findByPk.mockResolvedValue(null);
    const res = await svc.eliminarLosUsuarios(100);
    expect(res).toBeNull();
  });

  test('actualizarLosUsuario elimina rol si no es doctor', async () => {
    models.usuarios.findByPk.mockResolvedValue({ id: 5 });
    models.usuarios.update.mockResolvedValue([1]);
    const datos = { nombre: 'x', rol: 'admin' };
    const res = await svc.actualizarLosUsuario(5, datos, 'usuario');
    expect(models.usuarios.update).toHaveBeenCalledWith({ nombre: 'x' }, { where: { id: 5 } });
    expect(res).toEqual([1]);
  });

  test('actualizarLosUsuario retorna error si usuario no existe', async () => {
    models.usuarios.findByPk.mockResolvedValue(null);
    const res = await svc.actualizarLosUsuario(500, { nombre: 'y' }, 'doctor');
    expect(res).toEqual({ error: 'Usuario no encontrado' });
  });

  test('actualizarLosUsuario propaga error de update', async () => {
    models.usuarios.findByPk.mockResolvedValue({ id: 1 });
    models.usuarios.update.mockRejectedValue(new Error('fail'));
    await expect(svc.actualizarLosUsuario(1, { nombre: 'z' }, 'doctor')).rejects.toThrow('fail');
  });

  test('iniciarSesion maneja excepción y retorna error estándar', async () => {
    models.usuarios.findOne.mockRejectedValue(new Error('db down'));
    const res = await svc.iniciarSesion('e@e.com', 'pw');
    expect(res).toHaveProperty('error');
  });

  test('activarUsuario retorna error si no existe', async () => {
    models.usuarios.findByPk.mockResolvedValue(null);
    const res = await svc.activarUsuario(1, true);
    expect(res).toEqual({ error: 'Usuario no encontrado' });
  });

  test('activarUsuario maneja excepción y retorna error', async () => {
    models.usuarios.findByPk.mockRejectedValue(new Error('boom'));
    const res = await svc.activarUsuario(1, true);
    expect(res).toEqual({ error: 'Error al activar/desactivar usuario' });
  });

  test('obtenerNotificacionesPorUsuario migra leida y actualiza Redis', async () => {
    const items = [
      JSON.stringify({ id: 1, mensaje: 'a' }),
      JSON.stringify({ id: 2, mensaje: 'b', leida: true }),
    ];
    redis.lRange.mockResolvedValue(items);
    const res = await svc.obtenerNotificacionesPorUsuario(10);
    expect(res).toEqual([
      { id: 1, mensaje: 'a', leida: false },
      { id: 2, mensaje: 'b', leida: true },
    ]);
    expect(redis.del).toHaveBeenCalledWith('notificaciones:usuario:10');
    // lPush se llama en reversa para mantener orden
    expect(redis.lPush).toHaveBeenCalled();
  });

  test('obtenerNotificacionesPorUsuario maneja error y retorna error object', async () => {
    redis.lRange.mockRejectedValue(new Error('redis err'));
    const res = await svc.obtenerNotificacionesPorUsuario(11);
    expect(res).toEqual({ error: 'Error al obtener notificaciones' });
  });

  test('obtenerNotificacionesDoctor migra y actualiza Redis', async () => {
    const items = [JSON.stringify({ id: 5, mensaje: 'x' })];
    redis.lRange.mockResolvedValue(items);
    const res = await svc.obtenerNotificacionesDoctor(8);
    expect(res).toEqual([{ id: 5, mensaje: 'x', leida: false }]);
    expect(redis.del).toHaveBeenCalledWith('notificaciones:doctor:8');
  });

  test('obtenerNotificacionesDoctor en error retorna []', async () => {
    redis.lRange.mockRejectedValue(new Error('oops'));
    const res = await svc.obtenerNotificacionesDoctor(9);
    expect(res).toEqual([]);
  });

  test('marcarNotificacionComoLeida actualiza BD y Redis', async () => {
    const save = jest.fn(async () => {});
    models.notificaciones.findOne.mockResolvedValue({ id: 1, leida: false, save });
    redis.lRange.mockResolvedValue([
      JSON.stringify({ id: 1, leida: false }),
      JSON.stringify({ id: 2, leida: false }),
    ]);
    const res = await svc.marcarNotificacionComoLeida(3, 1);
    expect(save).toHaveBeenCalled();
    expect(redis.del).toHaveBeenCalledWith('notificaciones:doctor:3');
    expect(res).toEqual({ success: true });
  });

  test('marcarNotificacionComoLeida cuando no existe retorna error', async () => {
    models.notificaciones.findOne.mockResolvedValue(null);
    const res = await svc.marcarNotificacionComoLeida(3, 99);
    expect(res).toEqual({ error: 'Notificación no encontrada' });
  });

  test('marcarNotificacionComoLeida maneja excepción', async () => {
    models.notificaciones.findOne.mockRejectedValue(new Error('db err'));
    const res = await svc.marcarNotificacionComoLeida(1, 1);
    expect(res).toEqual({ error: 'Error al marcar notificación como leída' });
  });

  test('marcarTodasNotificacionesComoLeidas actualiza todas', async () => {
    redis.lRange.mockResolvedValue([
      JSON.stringify({ id: 1, leida: false }),
      JSON.stringify({ id: 2, leida: false }),
    ]);
    const res = await svc.marcarTodasNotificacionesComoLeidas(4);
    expect(res).toEqual({ success: true });
    expect(redis.del).toHaveBeenCalledWith('notificaciones:doctor:4');
  });

  test('marcarTodasNotificacionesComoLeidas maneja error', async () => {
    models.notificaciones.update.mockRejectedValue(new Error('fail'));
    const res = await svc.marcarTodasNotificacionesComoLeidas(4);
    expect(res).toEqual({ error: 'Error al marcar todas las notificaciones como leídas' });
  });

  test('archivarNotificacionesLeidas actualiza y limpia cache', async () => {
    models.notificaciones.update.mockResolvedValue([2]);
    const res = await svc.archivarNotificacionesLeidas(7);
    expect(res).toEqual({ success: true, archivadas: 2 });
    expect(redis.del).toHaveBeenCalledWith('notificaciones:doctor:7');
  });

  test('archivarNotificacionesLeidas maneja error', async () => {
    models.notificaciones.update.mockRejectedValue(new Error('err'));
    const res = await svc.archivarNotificacionesLeidas(7);
    expect(res).toEqual({ error: 'Error al archivar notificaciones' });
  });

  test('obtenerHistorialNotificaciones devuelve lista ordenada', async () => {
    models.notificaciones.findAll.mockResolvedValue([{ id: 1 }]);
    const res = await svc.obtenerHistorialNotificaciones(2);
    expect(models.notificaciones.findAll).toHaveBeenCalledWith({
      where: { id_usuario: 2 },
      order: [["fecha", "DESC"]],
    });
    expect(res).toEqual([{ id: 1 }]);
  });

  test('obtenerHistorialNotificaciones maneja error', async () => {
    models.notificaciones.findAll.mockRejectedValue(new Error('e'));
    const res = await svc.obtenerHistorialNotificaciones(2);
    expect(res).toEqual([]);
  });

  test('marcarNotificacionUsuarioComoLeida actualiza BD y Redis', async () => {
    const save = jest.fn(async () => {});
    models.notificaciones.findOne.mockResolvedValue({ id: 11, leida: false, save });
    redis.lRange.mockResolvedValue([
      JSON.stringify({ id: 11, leida: false }),
      JSON.stringify({ id: 12, leida: false }),
    ]);
    const res = await svc.marcarNotificacionUsuarioComoLeida(20, 11);
    expect(save).toHaveBeenCalled();
    expect(redis.del).toHaveBeenCalledWith('notificaciones:usuario:20');
    expect(res).toEqual({ success: true });
  });

  test('marcarNotificacionUsuarioComoLeida maneja error', async () => {
    models.notificaciones.findOne.mockRejectedValue(new Error('bad'));
    const res = await svc.marcarNotificacionUsuarioComoLeida(20, 11);
    expect(res).toEqual({ error: 'Error al marcar notificación como leída' });
  });

  test('archivarNotificacionesLeidasUsuario actualiza y limpia cache', async () => {
    models.notificaciones.update.mockResolvedValue([5]);
    const res = await svc.archivarNotificacionesLeidasUsuario(25);
    expect(res).toEqual({ success: true, archivadas: 5 });
    expect(redis.del).toHaveBeenCalledWith('notificaciones:usuario:25');
  });

  test('archivarNotificacionesLeidasUsuario maneja error', async () => {
    models.notificaciones.update.mockRejectedValue(new Error('no'));
    const res = await svc.archivarNotificacionesLeidasUsuario(25);
    expect(res).toEqual({ error: 'Error al archivar notificaciones usuario' });
  });

  test('marcarTodasNotificacionesUsuarioComoLeidas actualiza todas', async () => {
    redis.lRange.mockResolvedValue([
      JSON.stringify({ id: 1, leida: false }),
      JSON.stringify({ id: 2, leida: false }),
    ]);
    const res = await svc.marcarTodasNotificacionesUsuarioComoLeidas(30);
    expect(res).toEqual({ success: true });
    expect(redis.del).toHaveBeenCalledWith('notificaciones:usuario:30');
  });

  test('marcarTodasNotificacionesUsuarioComoLeidas maneja error', async () => {
    models.notificaciones.update.mockRejectedValue(new Error('meh'));
    const res = await svc.marcarTodasNotificacionesUsuarioComoLeidas(30);
    expect(res).toEqual({ error: 'Error al marcar todas las notificaciones como leídas' });
  });

  test('obtenerHistorialNotificacionesUsuario devuelve lista', async () => {
    models.notificaciones.findAll.mockResolvedValue([{ id: 99 }]);
    const res = await svc.obtenerHistorialNotificacionesUsuario(40);
    expect(models.notificaciones.findAll).toHaveBeenCalledWith({
      where: { id_usuario: 40 },
      order: [["fecha", "DESC"]],
    });
    expect(res).toEqual([{ id: 99 }]);
  });

  test('obtenerHistorialNotificacionesUsuario en error retorna []', async () => {
    models.notificaciones.findAll.mockRejectedValue(new Error('x'));
    const res = await svc.obtenerHistorialNotificacionesUsuario(40);
    expect(res).toEqual([]);
  });

  test('enviarCodigoVerificacion lanza si bloqueado', async () => {
    redis.get.mockResolvedValueOnce('1');
    await expect(svc.enviarCodigoVerificacion('b@b.com')).rejects.toThrow(/Has superado el número de intentos/);
  });

  test('enviarCodigoVerificacion éxito escribe Redis y envía correo', async () => {
    redis.get.mockResolvedValueOnce(null);
    const res = await svc.enviarCodigoVerificacion('c@c.com');
    expect(redis.setEx).toHaveBeenCalledWith(expect.stringContaining('codigo:c@c.com'), expect.any(Number), expect.any(String));
    expect(corre.EnviarCorreo).toHaveBeenCalled();
    expect(res).toBe(true);
  });

  test('verificarCodigo lanza si no hay código', async () => {
    redis.get.mockResolvedValueOnce(null);
    await expect(svc.verificarCodigo('d@d.com', '000')).rejects.toThrow('No hay código activo o ha expirado.');
  });

  test('verificarCodigo incorrecto incrementa intentos y no bloquea aún', async () => {
    redis.get.mockResolvedValueOnce('123');
    // incr -> 1
    redis.incr.mockResolvedValueOnce(1);
    const res = await svc.verificarCodigo('e@e.com', '000');
    expect(res).toEqual(expect.objectContaining({ success: false, blocked: false }));
    expect(redis.expire).toHaveBeenCalled();
  });

  test('verificarCodigo incorrecto bloquea al alcanzar límite', async () => {
    redis.get.mockResolvedValueOnce('123');
    redis.incr.mockResolvedValueOnce(3);
    const res = await svc.verificarCodigo('f@f.com', '000');
    expect(res).toEqual(expect.objectContaining({ success: false, blocked: true }));
    expect(redis.setEx).toHaveBeenCalledWith(expect.stringContaining('bloqueo:f@f.com'), expect.any(Number), '1');
  });

  test('verificarCodigo correcto limpia claves y retorna éxito', async () => {
    redis.get.mockResolvedValueOnce('999999');
    const res = await svc.verificarCodigo('g@g.com', '999999');
    expect(res).toEqual({ success: true });
    expect(redis.del).toHaveBeenCalledWith('codigo:g@g.com');
  });

  test('preRegistrarUsuario valida correo requerido', async () => {
    const res = await svc.preRegistrarUsuario({ contrasena: 'x' });
    expect(res).toEqual({ error: 'Correo es requerido' });
  });

  test('preRegistrarUsuario valida contraseña requerida', async () => {
    const res = await svc.preRegistrarUsuario({ correo: 'h@h.com' });
    expect(res).toEqual({ error: 'La contraseña es requerida' });
  });

  test('preRegistrarUsuario retorna error si ya existe usuario', async () => {
    models.usuarios.findOne.mockResolvedValue({ id: 1 });
    const res = await svc.preRegistrarUsuario({ correo: 'i@i.com', contrasena: 'x' });
    expect(res).toEqual({ error: 'El correo ya está registrado.' });
  });

  test('preRegistrarUsuario éxito guarda en Redis y envía código', async () => {
    models.usuarios.findOne.mockResolvedValue(null);
    // Evitar enviar correo real dentro de enviarCodigoVerificacion
    const spy = jest.spyOn(svc, 'enviarCodigoVerificacion').mockResolvedValue(true);
    const res = await svc.preRegistrarUsuario({ correo: 'j@j.com', contrasena: 'x', nombre: ' Juan ' });
    expect(redis.setEx).toHaveBeenCalledWith(expect.stringContaining('registro_pendiente:j@j.com'), 3600, expect.any(String));
    expect(spy).toHaveBeenCalledWith('j@j.com');
    expect(res).toEqual(expect.objectContaining({ success: true }));
  });

  test('confirmarRegistro retorna error si verificación falla', async () => {
    jest.spyOn(svc, 'verificarCodigo').mockResolvedValue({ success: false, message: 'bad' });
    const res = await svc.confirmarRegistro('k@k.com', '111111');
    expect(res).toEqual({ success: false, message: 'bad' });
  });

  test('confirmarRegistro retorna error si no hay registro pendiente', async () => {
    jest.spyOn(svc, 'verificarCodigo').mockResolvedValue({ success: true });
    redis.get.mockResolvedValueOnce(null);
    const res = await svc.confirmarRegistro('l@l.com', '111111');
    expect(res).toEqual({ error: 'Registro pendiente no encontrado o expirado.' });
  });

  test('confirmarRegistro retorna error si correo ya registrado', async () => {
    jest.spyOn(svc, 'verificarCodigo').mockResolvedValue({ success: true });
    const payload = { correo: 'm@m.com', contrasena: 'hashed:x', nombre: 'M' };
    redis.get.mockResolvedValueOnce(JSON.stringify(payload));
    models.usuarios.findOne.mockResolvedValueOnce({ id: 2 });
    const res = await svc.confirmarRegistro('m@m.com', '111111');
    expect(res).toEqual({ error: 'El correo ya está registrado.' });
    expect(redis.del).toHaveBeenCalledWith('registro_pendiente:m@m.com');
  });
});
