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


// GET todos os produtos (admin vê ativos e inativos)
exports.getTodosProdutosAdmin = (req, res) => {
  db.query('SELECT * FROM produto ORDER BY ativo DESC, nome_prod ASC', (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
    res.json(result);
  });
};


// GET produto por id
exports.getProdutoById = (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM produto WHERE id_prod = ?', [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao buscar produto' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json(result[0]);
  });
};




exports.toggleAtivoProduto = (req, res) => {
  const { id } = req.params;
  const { ativo } = req.body;

  db.query(
    'UPDATE produto SET ativo = ? WHERE id_prod = ?',
    [ativo, id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao atualizar produto' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      res.json({ message: ativo ? 'Produto ativado!' : 'Produto desativado!' });
    }
  );
};


exports.getDashboard = (req, res) => {
  const sqlPedidos = `
    SELECT 
      COUNT(*) AS total_pedidos,
      SUM(total) AS faturamento_total,
      SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) AS pendentes,
      SUM(CASE WHEN status = 'confirmado' THEN 1 ELSE 0 END) AS confirmados,
      SUM(CASE WHEN status = 'entregue' THEN 1 ELSE 0 END) AS entregues
    FROM pedido
  `;

  const sqlEstoqueBaixo = `
    SELECT nome_prod, estoque 
    FROM produto 
    WHERE estoque <= 5 AND ativo = 1
    ORDER BY estoque ASC
  `;

  db.query(sqlPedidos, (err, pedidosResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
    }

    db.query(sqlEstoqueBaixo, (err, estoqueResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao buscar estoque' });
      }

      res.json({
        total_pedidos: pedidosResult[0].total_pedidos,
        faturamento_total: pedidosResult[0].faturamento_total || 0,
        pendentes: pedidosResult[0].pendentes,
        confirmados: pedidosResult[0].confirmados,
        entregues: pedidosResult[0].entregues,
        estoque_baixo: estoqueResult
      });
    });
  });
};