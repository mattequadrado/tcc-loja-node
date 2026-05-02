document.addEventListener("DOMContentLoaded", () => {
  const userArea = document.getElementById("user-area");

  fetch("/me", {
    credentials: "include"
  })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
      userArea.innerHTML = `
        <a href="pedidos.html" style="font-size:14px; color:#333; margin-right:8px;">Meus Pedidos</a>
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
  fetch("/logout", {
    method: "POST",
    credentials: "include"
  })
    .then(() => {
      location.reload();
    });
}