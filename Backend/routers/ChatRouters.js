const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/ChatControllers');

router.post('/consultar', ChatController.consultarchat);

module.exports = router;
