function carregarCarrinho() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const container = document.getElementById("lista-carrinho");
  const totalEl = document.getElementById("total");

  container.innerHTML = "";

  let total = 0;

  carrinho.forEach(item => {
    const div = document.createElement("div");

   
    div.classList.add("item-carrinho");

    const subtotal = item.preco * item.qtd;
    total += subtotal;

    div.innerHTML = `
      <div class="info">
        <h3>${item.nome}</h3>
        <p>R$ ${item.preco}</p>
      </div>

      <div class="acoes">
        <span>x${item.qtd}</span>
        <span>R$ ${subtotal.toFixed(2)}</span>
        <button onclick="removerItem(${item.id})">Remover</button>
      </div>
    `;

    container.appendChild(div);
  });

  totalEl.innerText = "R$ " + total.toFixed(2);
}


function removerItem(id) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  carrinho = carrinho.filter(item => item.id !== id);

  localStorage.setItem("carrinho", JSON.stringify(carrinho));

  carregarCarrinho();
}



function finalizarPedido() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  if (carrinho.length === 0) {
    alert("Carrinho vazio!");
    return;
  }


  const itensLimpos = carrinho.map(item => ({
    id: item.id,
    qtd: item.qtd
  }));

  fetch("http://localhost:3000/pedido", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
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
      console.log(err);
      alert("Erro ao enviar pedido");
    });
}



carregarCarrinho();