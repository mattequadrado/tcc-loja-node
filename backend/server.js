require('dotenv').config({ path: __dirname + '/.env' });
const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const rateLimit = require('express-rate-limit');
const app = express();

app.set('trust proxy', 1);

app.use(express.static(path.join(__dirname), { index: false }));
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));})


app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://tcc-loja-node.vercel.app',
    'http://localhost:3000',
    'https://tcc-loja-node-production.up.railway.app'
  ],
  credentials: true
}));

app.use(express.json());

const limiterGeral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Muitas requisições, tente novamente mais tarde.' }
});

const limiterLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas, tente novamente em 15 minutos.' }
});

app.use(limiterGeral);
app.use('/login', limiterLogin);
app.use('/register', limiterLogin);

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
  connectTimeout: 10000
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'Eu-sou-lindo-demais',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8,
    sameSite: 'none'
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

app.get('/{*path}', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Rodando em http://localhost:${PORT}`);
});