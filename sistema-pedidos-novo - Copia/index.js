const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'meu-segredo-super-secreto-2024';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0205',
  database: 'sistema_pedidos'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erro MySQL:', err.message);
    return;
  }
  console.log('✅ Conectado ao MySQL');
});

// ROTA DE REGISTRO
app.post('/registro', async (req, res) => {
  console.log('📝 Registro:', req.body);
  const { nome, email, senha } = req.body;
  
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);
    
    db.query('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', 
      [nome, email, senhaHash], 
      (error, result) => {
        if (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email já cadastrado' });
          }
          return res.status(500).json({ error: error.message });
        }
        res.json({ id: result.insertId, mensagem: 'Usuário registrado com sucesso!' });
      });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar registro' });
  }
});

// ROTA DE LOGIN
app.post('/login', async (req, res) => {
  console.log('📝 Login:', req.body.email);
  const { email, senha } = req.body;
  
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  
  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (error, results) => {
    if (error) return res.status(500).json({ error: error.message });
    if (results.length === 0) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }
    
    const usuario = results[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }
    
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, nome: usuario.nome },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
    });
  });
});

app.get('/', (req, res) => {
  res.json({ status: 'online' });
});

// MIDDLEWARE
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

// PRODUTOS (protegido)
app.get('/produtos', autenticarToken, (req, res) => {
  db.query('SELECT * FROM produtos', (error, results) => {
    if (error) return res.status(500).json({ error: error.message });
    res.json(results);
  });
});

app.post('/produtos', autenticarToken, (req, res) => {
  const { nome, preco, estoque } = req.body;
  db.query('INSERT INTO produtos (nome, preco, estoque) VALUES (?, ?, ?)',
    [nome, preco, estoque], (error, result) => {
      if (error) return res.status(500).json({ error: error.message });
      res.json({ id: result.insertId, mensagem: 'Produto criado!' });
    });
});

app.put('/produtos/:id', autenticarToken, (req, res) => {
  const { id } = req.params;
  const { nome, preco, estoque } = req.body;
  db.query('UPDATE produtos SET nome=?, preco=?, estoque=? WHERE id=?',
    [nome, preco, estoque, id], (error) => {
      if (error) return res.status(500).json({ error: error.message });
      res.json({ mensagem: 'Produto atualizado!' });
    });
});

app.delete('/produtos/:id', autenticarToken, (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM itens_pedido WHERE produto_id=?', [id], () => {
    db.query('DELETE FROM produtos WHERE id=?', [id], (error) => {
      if (error) return res.status(500).json({ error: error.message });
      res.json({ mensagem: 'Produto deletado!' });
    });
  });
});

// PEDIDOS (protegido)
app.get('/pedidos', autenticarToken, (req, res) => {
  db.query(`SELECT p.*, u.nome as usuario_nome FROM pedidos p LEFT JOIN usuarios u ON p.usuario_id = u.id`,
    (error, results) => {
      if (error) return res.status(500).json({ error: error.message });
      res.json(results);
    });
});

app.post('/pedidos', autenticarToken, (req, res) => {
  const { usuario_id, status } = req.body;
  db.query('INSERT INTO pedidos (usuario_id, status) VALUES (?, ?)',
    [usuario_id, status || 'Pendente'], (error, result) => {
      if (error) return res.status(500).json({ error: error.message });
      res.json({ id: result.insertId, mensagem: 'Pedido criado!' });
    });
});

app.get('/usuarios', autenticarToken, (req, res) => {
  db.query('SELECT id, nome, email FROM usuarios', (error, results) => {
    if (error) return res.status(500).json({ error: error.message });
    res.json(results);
  });
});

app.post('/itens-pedido', autenticarToken, (req, res) => {
  const { pedido_id, produto_id, quantidade, preco_unitario } = req.body;
  db.query('INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
    [pedido_id, produto_id, quantidade, preco_unitario], (error, result) => {
      if (error) return res.status(500).json({ error: error.message });
      res.json({ id: result.insertId, mensagem: 'Item adicionado!' });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log(`\n🔓 ROTAS PÚBLICAS:`);
  console.log(`   POST /registro`);
  console.log(`   POST /login`);
  console.log(`\n🔒 ROTAS PROTEGIDAS:`);
  console.log(`   GET  /produtos`);
  console.log(`   POST /produtos`);
  console.log(`   PUT  /produtos/:id`);
  console.log(`   DELETE /produtos/:id`);
  console.log(`   GET  /pedidos`);
  console.log(`   POST /pedidos`);
  console.log(`   GET  /usuarios`);
  console.log(`   POST /itens-pedido\n`);
});