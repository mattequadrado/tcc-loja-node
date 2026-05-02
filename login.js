function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  fetch("http://localhost:3000/login", {
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