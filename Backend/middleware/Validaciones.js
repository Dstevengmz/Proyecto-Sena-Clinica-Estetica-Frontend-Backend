const { body, validationResult } = require('express-validator');

const baseReglas = [
  body("nombre")
    .trim()
    .notEmpty().withMessage("Campo nombre es obligatorio")
    .isLength({ min: 5 }).withMessage("El nombre debe tener al menos 5 caracteres")
    .matches(/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/).withMessage("El nombre solo puede contener letras y espacios"),
  body("tipodocumento")
    .notEmpty().withMessage("Debe seleccionar un tipo de documento"),
  body("numerodocumento")
    .notEmpty().withMessage("El número de documento es obligatorio")
    .isLength({ min: 7, max: 10 }).withMessage("El número de documento debe tener entre 7 y 10 caracteres")
    .matches(/^\d+$/).withMessage("El número de documento debe contener solo dígitos"),
  body("correo")
    .notEmpty().withMessage("El correo es obligatorio")
    .isEmail().withMessage("El correo no es válido"),
  body("contrasena")
    .notEmpty().withMessage("La contraseña es obligatoria")
    .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  body("telefono")
    .notEmpty().withMessage("El número de teléfono es obligatorio")
    .matches(/^\+?[0-9\s]+$/).withMessage("El número de teléfono no es válido"),
  body("genero")
    .notEmpty().withMessage("Debe seleccionar un género"),
  // Aceptar true (booleano) o "true" (string)
  body("terminos_condiciones")
    .custom((v) => v === true || v === 'true')
    .withMessage("Debe aceptar los términos y condiciones"),
];

// Para creación por doctor/admin: rol requerido
const validarUsuario = [
  ...baseReglas,
  body("rol").notEmpty().withMessage("Debe seleccionar un rol"),
  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }
    next();
  }
];

// Para registro público: no se exige rol (el backend lo forzará a "usuario")
const validarUsuarioPublico = [
  ...baseReglas,
  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }
    next();
  }
];

module.exports = { validarUsuario, validarUsuarioPublico };
