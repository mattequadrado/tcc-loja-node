const db = require('../db');
const { enviarConfirmacaoPedido } = require('../mailer');

exports.criarPedido = (req, res) => {
  const { itens } = req.body;

  if (!itens || itens.length === 0) {
    return res.status(400).json({ error: 'Carrinho vazio' });
  }

  db.getConnection((err, connection) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao conectar ao banco' });
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res.status(500).json({ error: 'Erro ao iniciar transação' });
      }

      const sqlPedido = `INSERT INTO pedido (id_usuario, total, status) VALUES (?, 0, 'pendente')`;
      const idUsuario = req.session.usuario.id;

      connection.query(sqlPedido, [idUsuario], (err, result) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ error: 'Erro ao criar pedido' });
          });
        }

        const idPedido = result.insertId;
        const sqlBuscarPreco = `SELECT preco, nome_prod FROM produto WHERE id_prod = ?`;
        const sqlEstoque = `UPDATE produto SET estoque = estoque - ? WHERE id_prod = ? AND estoque >= ?`;
        const sqlItem = `INSERT INTO itens_pedido (id_pedido, id_prod, quantidade, preco) VALUES (?, ?, ?, ?)`;

        const itensResolvidos = [];
        let pendente = itens.length;
        let falhou = false;

        itens.forEach((item) => {
          if (falhou) return;

          const qtd = Number(item.qtd);

          connection.query(sqlBuscarPreco, [item.id], (err, result) => {
            if (falhou) return;

            if (err || result.length === 0) {
              falhou = true;
              return connection.rollback(() => {
                connection.release();
                res.status(400).json({ error: 'Produto não encontrado' });
              });
            }

            const precoReal = Number(result[0].preco);
            const nomeProd = result[0].nome_prod;

            connection.query(sqlEstoque, [qtd, item.id, qtd], (err, resultEstoque) => {
              if (falhou) return;

              if (err || resultEstoque.affectedRows === 0) {
                falhou = true;
                return connection.rollback(() => {
                  connection.release();
                  res.status(400).json({ error: `Estoque insuficiente para o seguinte produto: ${nomeProd}` });
                });
              }

              connection.query(sqlItem, [idPedido, item.id, qtd, precoReal], (err) => {
                if (falhou) return;

                if (err) {
                  falhou = true;
                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).json({ error: 'Erro ao salvar item' });
                  });
                }

                itensResolvidos.push({ preco: precoReal, qtd, nomeProd });
                pendente--;

                if (pendente === 0) {
                  const total = itensResolvidos.reduce(
                    (acc, i) => acc + i.preco * i.qtd, 0
                  );

                  connection.query(
                    'UPDATE pedido SET total = ? WHERE id_pedido = ?',
                    [total, idPedido],
                    (err) => {
                      if (err) {
                        return connection.rollback(() => {
                          connection.release();
                          res.status(500).json({ error: 'Erro ao atualizar total' });
                        });
                      }

                     
                      connection.commit((err) => {
                        if (err) {
                          return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ error: 'Erro ao finalizar pedido' });
                          });
                        }

                        connection.release();

                        const usuario = req.session.usuario;

                        const pedidoInfo = {
                          id_pedido: idPedido,
                          total,
                          status: 'pendente',
                          itens: itensResolvidos.map(i => ({
                            nome_prod: i.nomeProd,
                            quantidade: i.qtd,
                            preco: i.preco
                          }))
                        };

                      console.log('Usuario na sessão:', req.session.usuario);
                        enviarConfirmacaoPedido(usuario.email, usuario.nome, pedidoInfo)
                          .catch(err => console.error('Erro ao enviar email:', err));

                        res.status(201).json({
                          message: 'Pedido criado com sucesso!',
                          pedido_id: idPedido,
                          total
                        });
                      });
                    }
                  );
                }
              });
            });
          });
        });
      });
    });
  });
};


exports.meusPedidos = (req, res) => {
  const idUsuario = req.session.usuario.id;

  const sql = `
    SELECT 
      p.id_pedido,
      p.total,
      p.data,
      p.status,
      ip.quantidade,
      ip.preco,
      pr.nome_prod
    FROM pedido p
    JOIN itens_pedido ip ON p.id_pedido = ip.id_pedido
    JOIN produto pr ON ip.id_prod = pr.id_prod
    WHERE p.id_usuario = ?
    ORDER BY p.data DESC
  `;

  db.query(sql, [idUsuario], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }

    const pedidos = {};
    result.forEach(row => {
      if (!pedidos[row.id_pedido]) {
        pedidos[row.id_pedido] = {
          id_pedido: row.id_pedido,
          total: row.total,
          data: row.data,
          status: row.status,
          itens: []
        };
      }
      pedidos[row.id_pedido].itens.push({
        nome_prod: row.nome_prod,
        quantidade: row.quantidade,
        preco: row.preco
      });
    });

    res.json(Object.values(pedidos));
  });
};