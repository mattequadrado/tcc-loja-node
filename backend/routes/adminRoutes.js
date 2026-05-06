const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminController');
const { apenasAdmin } = require('../middlewares/authMiddleware');

router.get('/admin/pedidos', apenasAdmin, controller.getTodosPedidos);
router.put('/admin/pedidos/:id/status', apenasAdmin, controller.atualizarStatus);
router.get('/admin/produtos', apenasAdmin, controller.getTodosProdutosAdmin);
router.get('/admin/produtos/:id', apenasAdmin, controller.getProdutoById);
router.put('/admin/produtos/:id/ativo', apenasAdmin, controller.toggleAtivoProduto); 
router.get('/admin/dashboard', apenasAdmin, controller.getDashboard);

module.exports = router;