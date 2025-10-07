/*
  Propósito del archivo:
  Validar el comportamiento del middleware de autorización y utilidades de permisos.

  Cobertura de pruebas:
  - Autenticación por token JWT y manejo de errores 401/404.
  - Inyección del usuario autenticado en la solicitud (req.usuario).
  - Verificación de acceso por rol (verificarRol).
  - Reglas de acceso por pertenencia: doctor o propietario por id de historial/usuario.
*/

const jwt = require('jsonwebtoken');

jest.mock('../models', () => ({
  usuarios: { findByPk: jest.fn() },
  historialclinico: { findByPk: jest.fn() },
}));

const models = require('../models');

describe('Middleware de autorización', () => {
  const { authorization, verificarRol, permitirDoctorOPropietarioPorIdHistorial, permitirDoctorOPropietarioPorIdUsuario } = require('../middleware/Authorization');

  const makeRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('responde 401 si no hay token', async () => {
    const req = { header: () => null, method: 'GET', originalUrl: '/x' };
    const res = makeRes();
    await authorization(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Acceso denegado, token no proporcionado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('responde 401 si el token es inválido', async () => {
    const req = { header: () => 'Bearer badtoken', method: 'GET', originalUrl: '/x' };
    const res = makeRes();
    jest.spyOn(jwt, 'verify').mockImplementation(() => { throw new Error('invalid'); });
    await authorization(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Token inválido o expirado' });
  });

  it('responde 404 si usuario no existe', async () => {
    const token = jwt.sign({ id: 999 }, process.env.JWT_SECRET);
    jest.spyOn(jwt, 'verify').mockReturnValue({ id: 999 });
    models.usuarios.findByPk.mockResolvedValue(null);

    const req = { header: () => `Bearer ${token}`, method: 'GET', originalUrl: '/x' };
    const res = makeRes();
    await authorization(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Usuario no encontrado' });
  });

  it('llama next cuando el token y usuario son válidos', async () => {
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET);
    jest.spyOn(jwt, 'verify').mockReturnValue({ id: 1 });
    models.usuarios.findByPk.mockResolvedValue({ id: 1, rol: 'doctor' });

    const req = { header: () => `Bearer ${token}`, method: 'GET', originalUrl: '/x' };
    const res = makeRes();
    await authorization(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.usuario).toEqual({ id: 1, rol: 'doctor' });
  });

  describe('verificarRol', () => {
    it('permite si el rol está incluido', () => {
      const req = { usuario: { rol: 'doctor' }, originalUrl: '/x', method: 'GET' };
      const res = makeRes();
      const next = jest.fn();
      verificarRol(['doctor', 'asistente'])(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('bloquea si el rol no está incluido', () => {
      const req = { usuario: { rol: 'usuario' }, originalUrl: '/x', method: 'GET' };
      const res = makeRes();
      const next = jest.fn();
      verificarRol(['doctor'])(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'Acceso denegado por rol' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('permisos por pertenencia/rol', () => {
  test('permitirDoctorOPropietarioPorIdHistorial -> 400 id inválido', async () => {
      const req = { params: { id: 'abc' } };
      const res = makeRes();
      const next = jest.fn();
      await permitirDoctorOPropietarioPorIdHistorial(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('permitirDoctorOPropietarioPorIdHistorial -> 404 no encontrado', async () => {
      models.historialclinico.findByPk.mockResolvedValue(null);
      const req = { params: { id: '1' } };
      const res = makeRes();
      const next = jest.fn();
      await permitirDoctorOPropietarioPorIdHistorial(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('permitirDoctorOPropietarioPorIdHistorial -> permite doctor o propietario', async () => {
      models.historialclinico.findByPk.mockResolvedValue({ id: 1, id_usuario: 9 });
      const res = makeRes();
      const next = jest.fn();
      let req = { params: { id: '1' }, usuario: { id: 2, rol: 'doctor' } };
      await permitirDoctorOPropietarioPorIdHistorial(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      next.mockClear();
      req = { params: { id: '1' }, usuario: { id: 9, rol: 'usuario' } };
      await permitirDoctorOPropietarioPorIdHistorial(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    test('permitirDoctorOPropietarioPorIdHistorial -> 403 si no cumple', async () => {
      models.historialclinico.findByPk.mockResolvedValue({ id: 1, id_usuario: 9 });
      const req = { params: { id: '1' }, usuario: { id: 3, rol: 'usuario' } };
      const res = makeRes();
      const next = jest.fn();
      await permitirDoctorOPropietarioPorIdHistorial(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('permitirDoctorOPropietarioPorIdUsuario -> permite doctor o mismo usuario', async () => {
      const res = makeRes();
      const next = jest.fn();
      let req = { params: { id: '7' }, usuario: { id: 1, rol: 'doctor' } };
      permitirDoctorOPropietarioPorIdUsuario(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      next.mockClear();
      req = { params: { id: '7' }, usuario: { id: 7, rol: 'usuario' } };
      permitirDoctorOPropietarioPorIdUsuario(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    test('permitirDoctorOPropietarioPorIdUsuario -> 403 si no cumple', () => {
      const res = makeRes();
      const next = jest.fn();
      const req = { params: { id: '7' }, usuario: { id: 8, rol: 'usuario' } };
      permitirDoctorOPropietarioPorIdUsuario(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
