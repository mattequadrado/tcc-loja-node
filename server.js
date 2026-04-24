const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());


// Get
app.get('/produtos', (req, res) => {
  db.query('SELECT * FROM produto', (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
});


// Post
app.post('/produtos', (req, res) => {
  const { nome_prod, descricao, preco, estoque } = req.body;

  if (!nome_prod || !descricao || !preco || !estoque) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  const sql = `
    INSERT INTO produto (nome_prod, descricao, preco, estoque)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [nome_prod, descricao, preco, estoque], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json({
      id: result.insertId,
      nome_prod,
      descricao,
      preco,
      estoque
    });
  });
});


// Put
app.put('/produtos/:id', (req, res) => {
  const { id } = req.params;
  const { nome_prod, descricao, preco, estoque } = req.body;

  const sql = `
    UPDATE produto
    SET nome_prod = ?, descricao = ?, preco = ?, estoque = ?
    WHERE id_prod = ?
  `;

  db.query(sql, [nome_prod, descricao, preco, estoque, id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({ message: "Atualizado com sucesso!" });
  });
});


// Delete
app.delete('/produtos/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM produto WHERE id_prod = ?', [id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({ message: "Deletado com sucesso!" });
  });
});


// 
app.post('/pedido', (req, res) => {
  const pedido = req.body;

  console.log("Pedido recebido:", pedido);

  res.json({
    success: true,
    message: "Pedido criado!"
  });
});


app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});