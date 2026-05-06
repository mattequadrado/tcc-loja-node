const db = require('../db');

// GET: só retorna produtos ativos
exports.getProdutos = (req, res) => {
  db.query('SELECT * FROM produto WHERE ativo = 1', (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
    res.json(result);
  });
};

// POST
exports.criarProduto = (req, res) => {
  const { nome_prod, descricao, preco, estoque } = req.body;

  if (!nome_prod || !descricao || preco == null || estoque == null) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  if (typeof preco !== 'number' || preco < 0) {
    return res.status(400).json({ error: 'Preço inválido' });
  }

  if (!Number.isInteger(estoque) || estoque < 0) {
    return res.status(400).json({ error: 'Estoque inválido' });
  }

  const sql = `
    INSERT INTO produto (nome_prod, descricao, preco, estoque, ativo)
    VALUES (?, ?, ?, ?, 1)
  `;

  db.query(sql, [nome_prod, descricao, preco, estoque], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao criar produto' });
    }
    res.status(201).json({
      id: result.insertId,
      nome_prod,
      descricao,
      preco,
      estoque,
      ativo: 1
    });
  });
};

// PUT
exports.atualizarProduto = (req, res) => {
  const { id } = req.params;
  const { nome_prod, descricao, preco, estoque, ativo } = req.body;

  if (!nome_prod || !descricao || preco == null || estoque == null) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  const sql = `
    UPDATE produto
    SET nome_prod = ?, descricao = ?, preco = ?, estoque = ?, ativo = ?
    WHERE id_prod = ?
  `;

  db.query(sql, [nome_prod, descricao, preco, estoque, ativo ?? 1, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json({ message: 'Atualizado com sucesso!' });
  });
};

// DELETE: desativa o produto em vez de deletar
exports.deletarProduto = (req, res) => {
  const { id } = req.params;

  db.query('UPDATE produto SET ativo = 0 WHERE id_prod = ?', [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao desativar produto' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json({ message: 'Produto desativado com sucesso!' });
  });
};