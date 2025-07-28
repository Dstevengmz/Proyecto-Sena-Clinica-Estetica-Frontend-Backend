const redis = require('../config/redis');

const MAX_INTENTOS = 3;
const TIEMPO_BLOQUEO = 300; 

const verificarIntentos = async (req, res, next) => {
  const { correo } = req.body;
  const clave = `intentos:${correo}`;
  const intentos = await redis.get(clave);

  if (intentos && parseInt(intentos) >= MAX_INTENTOS) {
    console.log(`Usuario: ${correo} bloqueado por 5 minutos` );
    return res.status(429).json({ mensaje: 'Demasiados intentos. Intenta más tarde.' });
  }

  next();
};

const registrarIntentoFallido = async (correo) => {
  const clave = `intentos:${correo}`;
  const intentos = await redis.get(clave);

  if (intentos) {
    await redis.incr(clave);
  } else {
    await redis.setEx(clave, TIEMPO_BLOQUEO, "1");
  }
};

const limpiarIntentos = async (correo) => {
  await redis.del(`intentos:${correo}`);
};

module.exports = {
  verificarIntentos,
  registrarIntentoFallido,
  limpiarIntentos
};
