const express = require('express');
const router = express.Router();
const controller = require('../controllers/pedidoController');

router.post('/', controller.criarPedido);

module.exports = router;