/*
  Propósito del archivo:
  Pruebas unitarias para el middleware de intentos fallidos (rate-limit por credenciales): usa Redis para contar intentos por correo.

  Cobertura de pruebas:
  - verificarIntentos: permite cuando no hay intentos; bloquea con 429 al superar el máximo.
  - registrarIntentoFallido: crea y aumenta el contador en Redis.
  - limpiarIntentos: elimina el registro del contador en Redis.
*/

jest.mock('../config/redis', () => {
  let store = new Map();
  return {
    on: jest.fn(),
    connect: jest.fn(),
    get: jest.fn((k) => Promise.resolve(store.get(k)) ),
    setEx: jest.fn((k, _ttl, v) => { store.set(k, v); return Promise.resolve(); }),
    incr: jest.fn((k) => { const v = parseInt(store.get(k)||'0')+1; store.set(k, String(v)); return Promise.resolve(v); }),
    del: jest.fn((k) => { store.delete(k); return Promise.resolve(1); }),
    __reset: () => { store = new Map(); },
  };
});

const redis = require('../config/redis');
const { verificarIntentos, registrarIntentoFallido, limpiarIntentos } = require('../middleware/intentosfallidos');

describe('Middleware intentosfallidos (rate limit)', () => {
  beforeEach(() => redis.__reset());

  const makeRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  test('verificarIntentos permite cuando no hay intentos', async () => {
    const req = { body: { correo: 'a@b.com' } };
    const res = makeRes();
    const next = jest.fn();
    await verificarIntentos(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('verificarIntentos bloquea cuando supera MAX_INTENTOS', async () => {
    const correo = 'x@y.com';
    const key = `intentos:${correo}`;
    await redis.setEx(key, 300, '3');
    const req = { body: { correo } };
    const res = makeRes();
    const next = jest.fn();
    await verificarIntentos(req, res, next);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(next).not.toHaveBeenCalled();
  });

  test('registrarIntentoFallido crea y aumenta contador', async () => {
    const correo = 'z@z.com';
    const key = `intentos:${correo}`;
    await registrarIntentoFallido(correo);
    expect(await redis.get(key)).toBe('1');
    await registrarIntentoFallido(correo);
    expect(await redis.get(key)).toBe('2');
  });

  test('limpiarIntentos elimina el registro', async () => {
    const correo = 'w@w.com';
    const key = `intentos:${correo}`;
    await registrarIntentoFallido(correo);
    await limpiarIntentos(correo);
    expect(await redis.get(key)).toBeUndefined();
  });
});
