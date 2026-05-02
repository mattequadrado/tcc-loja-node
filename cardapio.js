const container = document.getElementById("lista-doces");
const pesquisa = document.getElementById("pesquisa");

let todosProdutos = [];

fetch("/produtos")
  .then(res => res.json())
  .then(data => {
    if (data.length === 0) {
      container.innerHTML = "<p>Nenhum produto disponível</p>";
      return;
    }

    todosProdutos = data;
    renderizarProdutos(data);
  })
  .catch(err => {
    console.error(err);
    container.innerHTML = "<p>Erro ao carregar produtos</p>";
  });


function renderizarProdutos(produtos) {
  container.innerHTML = "";

  if (produtos.length === 0) {
    container.innerHTML = "<p style='text-align:center; color:#999;'>Nenhum produto encontrado</p>";
    return;
  }

  produtos.forEach(produto => {
    const div = document.createElement("div");
    div.classList.add("produto-card");

    div.innerHTML = `
      <div class="nome-produto">
        <h3>${produto.nome_prod}</h3>
        <p class="descricao-produto">${produto.descricao || ''}</p>
      </div>
      <div class="preco">R$ ${Number(produto.preco).toFixed(2)}</div>
      <div class="produto-botao">
        <button onclick="adicionarCarrinho(${produto.id_prod}, '${produto.nome_prod}', ${produto.preco})">
          Adicionar ao Carrinho
        </button>
      </div>
    `;

    container.appendChild(div);
  });
}


// ✅ Busca funcionando
pesquisa.addEventListener("input", () => {
  const termo = pesquisa.value.toLowerCase().trim();
  const filtrados = todosProdutos.filter(p =>
    p.nome_prod.toLowerCase().includes(termo)
  );
  renderizarProdutos(filtrados);
});


function adicionarCarrinho(id, nome, preco) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  const itemExistente = carrinho.find(item => item.id === id);

  if (itemExistente) {
    itemExistente.qtd += 1;
  } else {
    carrinho.push({ id, nome, preco, qtd: 1 });
  }

  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  alert(`"${nome}" adicionado ao carrinho!`);
}