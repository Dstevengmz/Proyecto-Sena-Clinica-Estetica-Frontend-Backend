const express = require('express');
const rateLimit = require('express-rate-limit');
const ContactoController = require('../controllers/ContactoControllers');

const router = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/contacto', limiter, ContactoController.enviar);

module.exports = router;