const container = document.getElementById("lista-pedidos");

fetch(`${API_URL}/pedido/meus-pedidos`, {
  credentials: "include"
})
  .then(res => {
    if (res.status === 401) {
      window.location.href = "login.html";
      return;
    }
    return res.json();
  })
  .then(data => {
    if (!data || data.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 60px; color: #999;">
          <i class="bi bi-bag-x" style="font-size: 48px;"></i>
          <p style="margin-top: 15px;">Você ainda não fez nenhum pedido</p>
          <a href="cardapio.html" style="color: #c0392b;">Ver Cardápio</a>
        </div>
      `;
      return;
    }

    data.forEach(pedido => {
      const div = document.createElement("div");
      div.classList.add("pedido-card");

      const data_pedido = new Date(pedido.data).toLocaleDateString('pt-BR');

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
          <span>${data_pedido}</span>
          <span class="status status-${pedido.status}">${pedido.status}</span>
        </div>
        <div class="pedido-itens">
          ${itensHTML}
        </div>
        <div class="pedido-total">
          Total: <strong>R$ ${Number(pedido.total).toFixed(2)}</strong>
        </div>
      `;

      container.appendChild(div);
    });
  })
  .catch(err => {
    console.error(err);
    container.innerHTML = "<p>Erro ao carregar pedidos</p>";
  });