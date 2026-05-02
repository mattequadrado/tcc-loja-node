const express = require('express');
const cors = require('cors');
const session = require('express-session');

const app = express();

app.use(cors({
  origin: 'http://127.0.0.1:5500',
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: 'segredo',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true
  }
}));

// ROTAS
const authRoutes = require('./routes/authRoutes');
const produtoRoutes = require('./routes/produtos'); // seu CRUD

app.use('/', authRoutes);
app.use('/', produtoRoutes);

app.listen(3000, () => {
  console.log('Rodando em http://localhost:3000');
});