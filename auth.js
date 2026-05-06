document.addEventListener("DOMContentLoaded", () => {
  const userArea = document.getElementById("user-area");

  fetch(`${API_URL}/me`, {
    credentials: "include"
  })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
 userArea.innerHTML = `
  <a href="pedidos.html" class="icon" title="Meus Pedidos"><i class="bi bi-bag"></i></a>
  <span>Olá, ${data.usuario.nome}</span>
  <button class="btn-logout" onclick="logout()">Sair</button>
`;
    })
    .catch(() => {
      userArea.innerHTML = `
        <a href="login.html" class="icon"><i class="bi bi-person"></i></a>
      `;
    });
});

function logout() {
  fetch(`${API_URL}/logout`, {
    method: "POST",
    credentials: "include"
  })
    .then(() => {
      location.reload();
    });
}

function atualizarBadgeCarrinho() {
  const badge = document.getElementById("carrinho-count");
  if (!badge) return;

  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const total = carrinho.reduce((acc, item) => acc + item.qtd, 0);

  if (total > 0) {
    badge.style.display = "flex";
    badge.innerText = total;
  } else {
    badge.style.display = "none";
  }
}

atualizarBadgeCarrinho();
