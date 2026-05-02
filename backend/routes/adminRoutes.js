const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminController');
const { apenasAdmin } = require('../../middlewares/authMiddleware');

router.get('/admin/pedidos', apenasAdmin, controller.getTodosPedidos);
router.put('/admin/pedidos/:id/status', apenasAdmin, controller.atualizarStatus);

module.exports = router;