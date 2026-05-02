const container = document.getElementById("lista-doces");

fetch("http://localhost:3000/produtos")
  .then(res => res.json())
  .then(data => {

    if (data.length === 0) {
      container.innerHTML = "<p>Nenhum produto disponível</p>";
      return;
    }

    container.innerHTML = "";

    data.forEach(produto => {
      const div = document.createElement("div");

      
      div.classList.add("produto-card");

      div.innerHTML = `
        <div class="nome-produto">
          <h3>${produto.nome_prod}</h3>
        </div>

        <div class="preco">
          R$ ${produto.preco}
        </div>

        <div class="produto-botao">
          <button onclick="adicionarCarrinho(${produto.id_prod}, '${produto.nome_prod}', ${produto.preco})">
            Adicionar
          </button>
        </div>
      `;

      container.appendChild(div);
    });
  })
  .catch(err => {
    console.log(err);
    container.innerHTML = "<p>Erro ao carregar produtos</p>";
  });


// carrito
function adicionarCarrinho(id, nome, preco) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  const itemExistente = carrinho.find(item => item.id === id);

  if (itemExistente) {
    itemExistente.qtd += 1;
  } else {
    carrinho.push({
      id: id,
      nome: nome,
      preco: preco,
      qtd: 1
    });
  }

  localStorage.setItem("carrinho", JSON.stringify(carrinho));

  alert("Produto adicionado!");
}