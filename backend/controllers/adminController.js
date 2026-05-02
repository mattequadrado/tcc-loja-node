const db = require('../db');

// GET todos os pedidos
exports.getTodosPedidos = (req, res) => {
  const sql = `
    SELECT 
      p.id_pedido,
      p.total,
      p.data,
      p.status,
      u.nome AS nome_usuario,
      u.email,
      ip.quantidade,
      ip.preco,
      pr.nome_prod
    FROM pedido p
    JOIN usuario u ON p.id_usuario = u.id
    JOIN itens_pedido ip ON p.id_pedido = ip.id_pedido
    JOIN produto pr ON ip.id_prod = pr.id_prod
    ORDER BY p.data DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }

    const pedidos = {};
    result.forEach(row => {
      if (!pedidos[row.id_pedido]) {
        pedidos[row.id_pedido] = {
          id_pedido: row.id_pedido,
          total: row.total,
          data: row.data,
          status: row.status,
          nome_usuario: row.nome_usuario,
          email: row.email,
          itens: []
        };
      }
      pedidos[row.id_pedido].itens.push({
        nome_prod: row.nome_prod,
        quantidade: row.quantidade,
        preco: row.preco
      });
    });

    res.json(Object.values(pedidos));
  });
};


// PUT atualizar status do pedido
exports.atualizarStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const statusValidos = ['pendente', 'confirmado', 'entregue'];
  if (!statusValidos.includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }

  db.query(
    'UPDATE pedido SET status = ? WHERE id_pedido = ?',
    [status, id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao atualizar status' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      res.json({ message: 'Status atualizado!' });
    }
  );
};