require('dotenv').config({ path: __dirname + '/.env' });
const mysql = require('mysql2');



const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,

  
  connectTimeout: 10000,
  ssl: {
    rejectUnauthorized: false
  }
});


pool.getConnection((err, connection) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
  } else {
    console.log('Conectado ao MySQL!');
    connection.release();
  }
});




module.exports = pool;