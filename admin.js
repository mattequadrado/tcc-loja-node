let todosPedidos = [];
let filtroAtual = 'pendente';

// Verifica se é admin antes de carregar
fetch("/me", { credentials: "include" })
  .then(res => {
    if (!res.ok) {
      window.location.href = "login.html";
      return;
    }
    return res.json();
  })
  .then(data => {
    if (!data) return;
    if (data.usuario.tipo !== 'admin') {
      window.location.href = "index.html";
      return;
    }
    carregarPedidos();
  });


// ─── ABAS PRINCIPAIS ────────────────────────────────────

function mostrarAba(aba, btn) {
  document.querySelectorAll('.aba').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

  document.getElementById(`aba-${aba}`).style.display = 'block';
  btn.classList.add('active');

  if (aba === 'produtos') carregarProdutosAdmin();
}


// ─── PEDIDOS ─────────────────────────────────────────────

function carregarPedidos() {
  fetch("/admin/pedidos", { credentials: "include" })
    .then(res => res.json())
    .then(data => {
      todosPedidos = data;
      renderizarPedidos(filtroAtual);
    })
    .catch(err => {
      console.error(err);
      document.getElementById("lista-pedidos").innerHTML = "<p>Erro ao carregar pedidos</p>";
    });
}

function filtrarPedidos(status, btn) {
  filtroAtual = status;

  document.querySelectorAll('.sub-tab-btn').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');

  renderizarPedidos(status);
}

function renderizarPedidos(status) {
  const container = document.getElementById("lista-pedidos");
  const filtrados = todosPedidos.filter(p => p.status === status);

  if (filtrados.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 60px; color: #999;">
        <i class="bi bi-inbox" style="font-size: 48px;"></i>
        <p style="margin-top: 15px;">Nenhum pedido ${status}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  filtrados.forEach(pedido => {
    const div = document.createElement("div");
    div.classList.add("pedido-card");

    const dataPedido = new Date(pedido.data).toLocaleDateString('pt-BR');

    const itensHTML = pedido.itens.map(item => `
      <div class="pedido-item">
        <span>${item.nome_prod}</span>
        <span>x${item.quantidade}</span>
        <span>R$ ${Number(item.preco).toFixed(2)}</span>
      </div>
    `).join('');

    div.innerHTML = `
      <div class="pedido-header">
        <span><strong>Pedido #${pedido.id_pedido}</strong></span>
        <span>${pedido.nome_usuario} — ${pedido.email}</span>
        <span>${dataPedido}</span>
        <span class="status status-${pedido.status}">${pedido.status}</span>
      </div>
      <div class="pedido-itens">${itensHTML}</div>
      <div class="pedido-total">
        Total: <strong>R$ ${Number(pedido.total).toFixed(2)}</strong>
      </div>
      <div class="pedido-acoes">
        <select id="status-${pedido.id_pedido}">
          <option value="pendente" ${pedido.status === 'pendente' ? 'selected' : ''}>Pendente</option>
          <option value="confirmado" ${pedido.status === 'confirmado' ? 'selected' : ''}>Confirmado</option>
          <option value="entregue" ${pedido.status === 'entregue' ? 'selected' : ''}>Entregue</option>
        </select>
        <button onclick="atualizarStatus(${pedido.id_pedido})">Atualizar Status</button>
      </div>
    `;

    container.appendChild(div);
  });
}

function atualizarStatus(id) {
  const status = document.getElementById(`status-${id}`).value;

  fetch(`/admin/pedidos/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        return;
      }
      carregarPedidos();
    })
    .catch(() => alert("Erro ao atualizar status"));
}


// ─── PRODUTOS ────────────────────────────────────────────

function carregarProdutosAdmin() {
  fetch("/admin/produtos", { credentials: "include" })
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById("lista-produtos-admin");
      lista.innerHTML = "";

      data.forEach(produto => {
        const div = document.createElement("div");
        div.classList.add("produto-admin-card");

        div.innerHTML = `
          <div class="produto-admin-info">
            <strong>${produto.nome_prod}</strong>
            <span>${produto.descricao}</span>
            <span>R$ ${Number(produto.preco).toFixed(2)} — Estoque: ${produto.estoque}</span>
            <span class="status ${produto.ativo ? 'status-confirmado' : 'status-pendente'}">
              ${produto.ativo ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          <div class="produto-admin-acoes">
            <button onclick="editarProduto(${produto.id_prod})" class="btn-editar">
              <i class="bi bi-pencil"></i> Editar
            </button>
            <button onclick="toggleAtivo(${produto.id_prod}, ${produto.ativo})"
              class="${produto.ativo ? 'btn-cancelar' : 'btn-salvar'}">
              ${produto.ativo
                ? '<i class="bi bi-eye-slash"></i> Desativar'
                : '<i class="bi bi-eye"></i> Ativar'}
            </button>
          </div>
        `;

        lista.appendChild(div);
      });
    });
}

function toggleAtivo(id, ativoAtual) {
  const novoAtivo = ativoAtual ? 0 : 1;
  const msg = ativoAtual ? "Desativar este produto?" : "Ativar este produto?";

  if (!confirm(msg)) return;

  fetch(`/admin/produtos/${id}/ativo`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ ativo: novoAtivo })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        return;
      }
      carregarProdutosAdmin();
    });
}

function editarProduto(id) {
  fetch(`/admin/produtos/${id}`, { credentials: "include" })
    .then(res => res.json())
    .then(produto => {
      document.getElementById("edit-id").value = produto.id_prod;
      document.getElementById("edit-nome").value = produto.nome_prod;
      document.getElementById("edit-descricao").value = produto.descricao;
      document.getElementById("edit-preco").value = produto.preco;
      document.getElementById("edit-estoque").value = produto.estoque;

      document.getElementById("modal-editar").style.display = "flex";
    });
}

function fecharModal() {
  document.getElementById("modal-editar").style.display = "none";
}

function salvarEdicao() {
  const id = document.getElementById("edit-id").value;
  const nome_prod = document.getElementById("edit-nome").value.trim();
  const descricao = document.getElementById("edit-descricao").value.trim();
  const preco = Number(document.getElementById("edit-preco").value);
  const estoque = Number(document.getElementById("edit-estoque").value);

  if (!nome_prod || !descricao || !preco || estoque === '') {
    alert("Preencha todos os campos");
    return;
  }

  fetch(`/produtos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ nome_prod, descricao, preco, estoque, ativo: 1 })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        return;
      }
      alert("Produto atualizado!");
      fecharModal();
      carregarProdutosAdmin();
    });
}

function criarProduto() {
  const nome_prod = document.getElementById("prod-nome").value.trim();
  const descricao = document.getElementById("prod-descricao").value.trim();
  const preco = Number(document.getElementById("prod-preco").value);
  const estoque = Number(document.getElementById("prod-estoque").value);

  if (!nome_prod || !descricao || !preco || estoque === '') {
    alert("Preencha todos os campos");
    return;
  }

  fetch("/produtos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ nome_prod, descricao, preco, estoque })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        return;
      }
      alert("Produto criado!");
      document.getElementById("prod-nome").value = "";
      document.getElementById("prod-descricao").value = "";
      document.getElementById("prod-preco").value = "";
      document.getElementById("prod-estoque").value = "";
      carregarProdutosAdmin();
    });
}