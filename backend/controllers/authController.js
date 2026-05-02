const db = require('../db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// REGISTER
const register = (req, res) => {
  const { nome, email, senha, telefone } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Preencha todos os campos' });
  }

  db.query('SELECT id FROM usuario WHERE email = ?', [email], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length > 0) {
      return res.status(400).json({ error: 'Email já existe' });
    }

    bcrypt.hash(senha, SALT_ROUNDS, (err, hash) => {
      if (err) return res.status(500).json(err);

      const sql = `
        INSERT INTO usuario (nome, email, senha, telefone, tipo_email)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(sql, [nome, email, hash, telefone || null, 'cliente'], (err, result) => {
        if (err) return res.status(500).json(err);

        res.json({ message: 'Usuário criado com sucesso' });
      });
    });
  });
};


// LOGIN
const login = (req, res) => {
  const { email, senha } = req.body;

  db.query('SELECT * FROM usuario WHERE email = ?', [email], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const user = result[0];

    bcrypt.compare(senha, user.senha, (err, match) => {
      if (err) return res.status(500).json(err);

      if (!match) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      req.session.usuario = {
        id: user.id,
        nome: user.nome,
        tipo: user.tipo_email
      };

      res.json({
        message: 'Login feito',
        usuario: req.session.usuario
      });
    });
  });
};


// LOGOUT
const logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logout feito' });
  });
};

module.exports = { register, login, logout };