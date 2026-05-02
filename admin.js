const container = document.getElementById("lista-pedidos");

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


function carregarPedidos() {
  fetch("/admin/pedidos", { credentials: "include" })
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding: 60px; color: #999;">
            <i class="bi bi-inbox" style="font-size: 48px;"></i>
            <p style="margin-top: 15px;">Nenhum pedido ainda</p>
          </div>
        `;
        return;
      }

      container.innerHTML = "";

      data.forEach(pedido => {
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
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = "<p>Erro ao carregar pedidos</p>";
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
      alert("Status atualizado!");
      carregarPedidos();
    })
    .catch(() => alert("Erro ao atualizar status"));
}