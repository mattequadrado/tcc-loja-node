
function carregarCarrinho() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const container = document.getElementById("lista-carrinho");
  const totalEl = document.getElementById("total");

  container.innerHTML = "";

  let total = 0;

  carrinho.forEach(item => {
    const div = document.createElement("div");

    const subtotal = item.preco * item.qtd;
    total += subtotal;

    div.innerHTML = `
      <h3>${item.nome}</h3>
      <p>Preço: R$ ${item.preco}</p>
      <p>Quantidade: ${item.qtd}</p>
      <p>Subtotal: R$ ${subtotal}</p>
      <button onclick="removerItem(${item.id})">Remover</button>
      <hr>
    `;

    container.appendChild(div);
  });

  totalEl.innerText = "Total: R$ " + total;
}


//  Remover item
function removerItem(id) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  carrinho = carrinho.filter(item => item.id !== id);

  localStorage.setItem("carrinho", JSON.stringify(carrinho));

  carregarCarrinho();
}


// Finalizar o pedido
function finalizarPedido() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  if (carrinho.length === 0) {
    alert("Carrinho vazio!");
    return;
  }

  fetch("http://localhost:3000/pedido", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ itens: carrinho })
  })
    .then(res => res.json())
    .then(data => {
      alert("Pedido enviado!");

      localStorage.removeItem("carrinho");

      carregarCarrinho();
    })
    .catch(err => console.log(err));
}



carregarCarrinho();