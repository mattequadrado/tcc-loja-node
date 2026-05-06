require('dotenv').config({ path: __dirname + '/.env' });
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function enviarConfirmacaoPedido(emailCliente, nomeCliente, pedido) {
  const itensHTML = pedido.itens.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.nome_prod}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">x${item.quantidade}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">R$ ${Number(item.preco).toFixed(2)}</td>
    </tr>
  `).join('');

  await transporter.sendMail({
    from: `"Amor Doce" <${process.env.EMAIL_USER}>`,
    to: emailCliente,
    subject: `Pedido #${pedido.id_pedido} recebido!`,
    html: `
      <div style="font-family: Poppins, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #c0392b;">Amor Doce</h2>
        <p>Olá, <strong>${nomeCliente}</strong>! Seu pedido foi recebido com sucesso.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f9f9f9;">
              <th style="padding: 8px; text-align: left;">Produto</th>
              <th style="padding: 8px; text-align: left;">Qtd</th>
              <th style="padding: 8px; text-align: left;">Preço</th>
            </tr>
          </thead>
          <tbody>${itensHTML}</tbody>
        </table>

        <p style="font-size: 16px;">
          <strong>Total: R$ ${Number(pedido.total).toFixed(2)}</strong>
        </p>

        <p style="color: #888; font-size: 13px;">
          Status atual: <strong>${pedido.status}</strong><br>
          Entraremos em contato em breve para confirmar seu pedido.
        </p>
      </div>
    `
  });
}

module.exports = { enviarConfirmacaoPedido };