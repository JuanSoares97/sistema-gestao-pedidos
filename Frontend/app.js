const API = 'http://localhost:3000';

// 🔍 listar produtos
async function carregarProdutos() {
  const res = await fetch(`${API}/produtos`);
  const produtos = await res.json();

  const lista = document.getElementById('lista-produtos');
  lista.innerHTML = '';

  produtos.forEach(p => {
    const li = document.createElement('li');
    li.innerText = `${p.nome} - R$ ${p.preco}`;
    lista.appendChild(li);
  });
}

// 📦 criar pedido
async function criarPedido() {
  await fetch(`${API}/pedidos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      usuario_id: 1,
      status: 'PENDENTE'
    })
  });

  alert('Pedido criado!');
  carregarPedidos();
}

// 📋 listar pedidos
async function carregarPedidos() {
  const res = await fetch(`${API}/pedidos`);
  const pedidos = await res.json();

  const lista = document.getElementById('lista-pedidos');
  lista.innerHTML = '';

  pedidos.forEach(p => {
    const li = document.createElement('li');
    li.innerText = `Pedido ${p.id} - ${p.status}`;
    lista.appendChild(li);
  });
}

// iniciar
carregarProdutos();
carregarPedidos();
