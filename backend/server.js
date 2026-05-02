const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');

const app = express();

// Serve o frontend
app.use(express.static(path.join(__dirname, '../')));

app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'Eu-sou-lindo-demais',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8,
    sameSite: 'lax'
  }
}));

const authRoutes = require('./routes/authRoutes');
const produtoRoutes = require('./routes/produtos');
const pedidoRoutes = require('./routes/pedido');
const adminRoutes = require('./routes/adminRoutes');

app.use('/', authRoutes);
app.use('/produtos', produtoRoutes);
app.use('/pedido', pedidoRoutes);
app.use('/', adminRoutes);

app.listen(3000, () => {
  console.log('Rodando em http://localhost:3000');
});



