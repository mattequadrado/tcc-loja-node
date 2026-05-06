function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({ email, senha })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        return;
      }

      alert("Login feito!");
      window.location.href = "index.html";
    });
}