const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0205',
  database: 'sistema_pedidos'
});

db.connect((err) => {
  if (err) {
    console.error('Erro MySQL:', err.message);
    return;
  }
  console.log('Conectado ao MySQL');
});

app.get('/', (req, res) => {
  res.json({ status: 'online', mensagem: 'API funcionando!' });
});

app.get('/usuarios', (req, res) => {
  db.query('SELECT id, nome, email FROM usuarios', (error, results) => {
    if (error) return res.status(500).json({ error: error.message });
    res.json(results);
  });
});

app.post('/usuarios', (req, res) => {
  const { nome, email, senha } = req.body;
  const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
  db.query(sql, [nome, email, senha], (error, result) => {
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: result.insertId, mensagem: 'Usuario criado!' });
  });
});

app.get('/produtos', (req, res) => {
  db.query('SELECT * FROM produtos', (error, results) => {
    if (error) return res.status(500).json({ error: error.message });
    res.json(results);
  });
});

app.post('/produtos', (req, res) => {
  const { nome, preco, estoque } = req.body;
  const sql = 'INSERT INTO produtos (nome, preco, estoque) VALUES (?, ?, ?)';
  db.query(sql, [nome, preco, estoque], (error, result) => {
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: result.insertId, mensagem: 'Produto criado!' });
  });
});

app.get('/pedidos', (req, res) => {
  console.log('GET /pedidos chamado');
  db.query('SELECT * FROM pedidos', (error, results) => {
    if (error) return res.status(500).json({ error: error.message });
    res.json(results);
  });
});

app.post('/pedidos', (req, res) => {
  const { usuario_id, status } = req.body;
  if (!usuario_id) {
    return res.status(400).json({ error: 'usuario_id obrigatorio' });
  }
  const sql = 'INSERT INTO pedidos (usuario_id, status) VALUES (?, ?)';
  db.query(sql, [usuario_id, status || 'Pendente'], (error, result) => {
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: result.insertId, mensagem: 'Pedido criado!' });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\nServidor rodando na porta ${PORT}`);
  console.log(`GET /usuarios`);
  console.log(`GET /produtos`);
  console.log(`GET /pedidos`);
  console.log(`POST /pedidos\n`);
});
