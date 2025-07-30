const { body, validationResult } = require('express-validator');
const validarUsuario = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("Campo nombre es obligatorio")
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

  body("rol")
    .notEmpty().withMessage("Debe seleccionar un rol"),

  body("telefono")
    .notEmpty().withMessage("El número de teléfono es obligatorio")
    .matches(/^\+?[0-9\s]+$/).withMessage("El número de teléfono no es válido"),

  body("genero")
    .notEmpty().withMessage("Debe seleccionar un género"),

  body("terminos_condiciones")
    .isBoolean().withMessage("Los términos y condiciones deben ser un valor booleano")
    .equals("true").withMessage("Debe aceptar los términos y condiciones"),

    (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      // console.log("Errores de validación:", errores.array());
      return res.status(400).json({ errores: errores.array() });
    }
    next();
  }
];

module.exports = validarUsuario;
