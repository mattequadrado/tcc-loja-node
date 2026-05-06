const express = require('express');
const router = express.Router();
const controller = require('../controllers/pedidoController');
const { autenticado } = require('../middlewares/authMiddleware');

router.post('/', autenticado, controller.criarPedido);
router.get('/meus-pedidos', autenticado, controller.meusPedidos);

module.exports = router;