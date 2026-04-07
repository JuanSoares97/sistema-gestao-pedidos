import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API = 'http://localhost:3000';

function App() {
  const [produtos, setProdutos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [registroNome, setRegistroNome] = useState('');
  const [registroEmail, setRegistroEmail] = useState('');
  const [registroSenha, setRegistroSenha] = useState('');
  const [aba, setAba] = useState('login');

  // Configurar axios com token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Carregar dados se estiver logado
  useEffect(() => {
    if (token && usuarioLogado) {
      carregarProdutos();
      carregarPedidos();
      carregarUsuarios();
    }
  }, [token, usuarioLogado]);

  const fazerLogin = async (e) => {
    e.preventDefault();
    setCarregando(true);
    try {
      const res = await axios.post(`${API}/login`, {
        email: loginEmail,
        senha: loginSenha
      });
      const { token, usuario } = res.data;
      setToken(token);
      setUsuarioLogado(usuario);
      localStorage.setItem('token', token);
      alert(`Bem-vindo, ${usuario.nome}!`);
      setAba('produtos');
    } catch (error) {
      alert('Erro no login: ' + (error.response?.data?.error || error.message));
    }
    setCarregando(false);
  };

  const fazerRegistro = async (e) => {
    e.preventDefault();
    setCarregando(true);
    try {
      await axios.post(`${API}/registro`, {
        nome: registroNome,
        email: registroEmail,
        senha: registroSenha
      });
      alert('Usuário registrado! Faça login.');
      setAba('login');
      setRegistroNome('');
      setRegistroEmail('');
      setRegistroSenha('');
    } catch (error) {
      alert('Erro no registro: ' + (error.response?.data?.error || error.message));
    }
    setCarregando(false);
  };

  const fazerLogout = () => {
    setToken('');
    setUsuarioLogado(null);
    localStorage.removeItem('token');
    setAba('login');
  };

  const carregarProdutos = async () => {
    try {
      const res = await axios.get(`${API}/produtos`);
      setProdutos(res.data);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const carregarPedidos = async () => {
    try {
      const res = await axios.get(`${API}/pedidos`);
      setPedidos(res.data);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const carregarUsuarios = async () => {
    try {
      const res = await axios.get(`${API}/usuarios`);
      setUsuarios(res.data);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const criarPedido = async () => {
    setCarregando(true);
    try {
      await axios.post(`${API}/pedidos`, {
        usuario_id: usuarioLogado?.id || 1,
        status: 'Pendente'
      });
      alert('Pedido criado!');
      carregarPedidos();
    } catch (error) {
      alert('Erro: ' + error.message);
    }
    setCarregando(false);
  };

  const criarProduto = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setCarregando(true);
    try {
      await axios.post(`${API}/produtos`, {
        nome: formData.get('nome'),
        preco: parseFloat(formData.get('preco')),
        estoque: parseInt(formData.get('estoque'))
      });
      alert('Produto criado!');
      carregarProdutos();
      e.target.reset();
    } catch (error) {
      alert('Erro: ' + error.message);
    }
    setCarregando(false);
  };

  // Tela de login
  if (!token || !usuarioLogado) {
    return (
      <div className="app login-page">
        <div className="login-container">
          <h1>📦 Sistema de Gestão de Pedidos</h1>
          
          {aba === 'login' ? (
            <div className="login-card">
              <h2>🔐 Login</h2>
              <form onSubmit={fazerLogin}>
                <input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                <input type="password" placeholder="Senha" value={loginSenha} onChange={(e) => setLoginSenha(e.target.value)} required />
                <button type="submit" disabled={carregando}>Entrar</button>
              </form>
              <p>Não tem conta? <button onClick={() => setAba('registro')}>Registre-se</button></p>
            </div>
          ) : (
            <div className="login-card">
              <h2>📝 Registro</h2>
              <form onSubmit={fazerRegistro}>
                <input type="text" placeholder="Nome" value={registroNome} onChange={(e) => setRegistroNome(e.target.value)} required />
                <input type="email" placeholder="Email" value={registroEmail} onChange={(e) => setRegistroEmail(e.target.value)} required />
                <input type="password" placeholder="Senha" value={registroSenha} onChange={(e) => setRegistroSenha(e.target.value)} required />
                <button type="submit" disabled={carregando}>Registrar</button>
              </form>
              <p>Já tem conta? <button onClick={() => setAba('login')}>Faça login</button></p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Dashboard (conteúdo principal)
  return (
    <div className="app">
      <header className="header">
        <h1>📦 Sistema de Gestão de Pedidos</h1>
        <div className="user-info">
          <span>👤 {usuarioLogado.nome}</span>
          <button onClick={fazerLogout}>Sair</button>
        </div>
        <div className="abas">
          <button className={aba === 'produtos' ? 'aba-ativa' : ''} onClick={() => setAba('produtos')}>🛒 Produtos</button>
          <button className={aba === 'pedidos' ? 'aba-ativa' : ''} onClick={() => setAba('pedidos')}>📋 Pedidos</button>
          <button className={aba === 'usuarios' ? 'aba-ativa' : ''} onClick={() => setAba('usuarios')}>👤 Usuários</button>
          <button className={aba === 'novo-produto' ? 'aba-ativa' : ''} onClick={() => setAba('novo-produto')}>➕ Novo Produto</button>
        </div>
      </header>

      <div className="container">
        {aba === 'produtos' && (
          <div className="section">
            <h2>🛒 Produtos</h2>
            <div className="grid">
              {produtos.map(p => (
                <div key={p.id} className="card">
                  <h3>{p.nome}</h3>
                  <p className="preco">R$ {parseFloat(p.preco).toFixed(2)}</p>
                  <p>📦 Estoque: {p.estoque}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {aba === 'pedidos' && (
          <div className="section">
            <h2>📋 Pedidos</h2>
            <button className="btn-criar" onClick={criarPedido} disabled={carregando}>➕ Criar Pedido</button>
            {pedidos.map(p => (
              <div key={p.id} className="card">
                <strong>Pedido #{p.id}</strong> - {p.status}<br />
                Usuário: {p.usuario_nome || p.usuario_id}<br />
                Data: {new Date(p.data_pedido).toLocaleString()}
              </div>
            ))}
          </div>
        )}

        {aba === 'usuarios' && (
          <div className="section">
            <h2>👤 Usuários</h2>
            <div className="grid">
              {usuarios.map(u => (
                <div key={u.id} className="card">
                  <h3>{u.nome}</h3>
                  <p>📧 {u.email}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {aba === 'novo-produto' && (
          <div className="section">
            <h2>➕ Novo Produto</h2>
            <form onSubmit={criarProduto} className="form">
              <input type="text" name="nome" placeholder="Nome" required />
              <input type="number" step="0.01" name="preco" placeholder="Preço" required />
              <input type="number" name="estoque" placeholder="Estoque" required />
              <button type="submit" disabled={carregando}>Criar</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;