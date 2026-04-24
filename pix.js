const mercadopago = require("mercadopago");

mercadopago.configure({
  access_token: "VOCE VAI COLOCAR O TOKEN QUANDO TIVER UM SEU RETARDADO N ESQUECA DISSO"
});

module.exports = mercadopago;




// coloca isso no server.js quando vc arrumar o token: const mercadopago = require("./pix");
// e tambem o codigo do pix ja ta nas notas q vc salvou seu animal