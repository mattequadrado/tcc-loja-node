function carregarCarrinho() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const container = document.getElementById("lista-carrinho");
  const totalEl = document.getElementById("total");

  container.innerHTML = "";
  let total = 0;

  if (carrinho.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 60px; color: #999;">
        <i class="bi bi-cart-x" style="font-size: 48px;"></i>
        <p style="margin-top: 15px;">Seu carrinho está vazio</p>
        <a href="cardapio.html" style="color: #c0392b;">Ver Cardápio</a>
      </div>
    `;
    totalEl.innerText = "R$ 0.00";
    return;
  }

  carrinho.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("item-carrinho");

    const subtotal = item.preco * item.qtd;
    total += subtotal;

    div.innerHTML = `
      <div class="info">
        <h3>${item.nome}</h3>
        <p>R$ ${item.preco.toFixed(2)}</p>
      </div>
      <div class="acoes">
        <button class="btn-qtd" onclick="diminuirQtd(${item.id})">−</button>
        <span>${item.qtd}</span>
        <button class="btn-qtd" onclick="aumentarQtd(${item.id})">+</button>
        <span>R$ ${subtotal.toFixed(2)}</span>
        <button class="btn-remover" onclick="removerItem(${item.id})">Remover</button>
      </div>
    `;

    container.appendChild(div);
  });

  totalEl.innerText = "R$ " + total.toFixed(2);
}


function aumentarQtd(id) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const item = carrinho.find(i => i.id === id);
  if (item) item.qtd += 1;
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  carregarCarrinho();
}


function diminuirQtd(id) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const item = carrinho.find(i => i.id === id);

  if (item) {
    if (item.qtd === 1) {
      // Se chegar em 1 e diminuir, remove o item
      carrinho = carrinho.filter(i => i.id !== id);
    } else {
      item.qtd -= 1;
    }
  }

  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  carregarCarrinho();
}


function removerItem(id) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinho = carrinho.filter(item => item.id !== id);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  carregarCarrinho();
}


async function finalizarPedido() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  if (carrinho.length === 0) {
    alert("Carrinho vazio!");
    return;
  }

  const sessao = await fetch("/me", {
    credentials: "include"
  });

  if (!sessao.ok) {
    alert("Você precisa estar logado para finalizar o pedido!");
    window.location.href = "login.html";
    return;
  }

  const itensLimpos = carrinho.map(item => ({
    id: item.id,
    qtd: item.qtd
  }));

  fetch("/pedido", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ itens: itensLimpos })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        return;
      }

      alert("Pedido enviado com sucesso!");
      localStorage.removeItem("carrinho");
      carregarCarrinho();
    })
    .catch(err => {
      console.error(err);
      alert("Erro ao enviar pedido");
    });
}


carregarCarrinho();