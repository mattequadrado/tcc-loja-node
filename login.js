function login() {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!email || !senha) {
    alert("Preencha email e senha");
    return;
  }
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include", 
    body: JSON.stringify({
      email: email,
      senha: senha
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        return;
      }

      alert("Login feito com sucesso!");

     
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      
      window.location.href = "index.html";
    })
    .catch(err => {
      console.log(err);
      alert("Erro no login");
    });
}