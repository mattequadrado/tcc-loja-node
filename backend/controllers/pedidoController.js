const db = require('../db');

exports.criarPedido = (req, res) => {
  const { itens } = req.body;

  if (!itens || itens.length === 0) {
    return res.status(400).json({ error: 'Carrinho vazio' });
  }


  let total = 0;

  db.beginTransaction((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao iniciar transação' });
    }


    const sqlPedido = `INSERT INTO pedido (total, status)VALUES (0, 'pendente')`;

    db.query(sqlPedido, (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error(err);
          res.status(500).json({ error: 'Erro ao criar pedido' });
        });
      }

      const idPedido = result.insertId;

      const sqlBuscarPreco = `SELECT preco FROM produto WHERE id_prod = ?`;

      const sqlItem = `INSERT INTO itens_pedido (id_pedido, id_prod, quantidade, preco) VALUES (?, ?, ?, ?)`;

      const sqlEstoque = `UPDATE produtoSET estoque = estoque - ?WHERE id_prod = ? AND estoque >= ?
      `;

      let pendente = itens.length;
      let falhou = false;

      itens.forEach((item) => {
        if (falhou) return;

        const qtd = Number(item.qtd);

        // 🔹 1. buscar preço real
        db.query(sqlBuscarPreco, [item.id], (err, result) => {
          if (falhou) return;

          if (err || result.length === 0) {
            falhou = true;
            return db.rollback(() => {
              res.status(400).json({ error: 'Produto não encontrado' });
            });
          }

          const precoReal = Number(result[0].preco);

          // 🔹 2. atualizar estoque
          db.query(sqlEstoque, [qtd, item.id, qtd], (err, resultEstoque) => {
            if (falhou) return;

            if (err || resultEstoque.affectedRows === 0) {
              falhou = true;
              return db.rollback(() => {
                res.status(400).json({ error: 'Estoque insuficiente' });
              });
            }

            // 🔹 3. salvar item
            db.query(sqlItem, [idPedido, item.id, qtd, precoReal], (err) => {
              if (falhou) return;

              if (err) {
                falhou = true;
                return db.rollback(() => {
                  console.error(err);
                  res.status(500).json({ error: 'Erro ao salvar item' });
                });
              }

              // 🔹 4. somar total
              total += precoReal * qtd;

              pendente--;

              // 🔹 5. finaliza quando acabar
              if (pendente === 0) {
                db.query(
                  'UPDATE pedido SET total = ? WHERE id_pedido = ?',
                  [total, idPedido],
                  (err) => {
                    if (err) {
                      return db.rollback(() => {
                        res.status(500).json({ error: 'Erro ao atualizar total' });
                      });
                    }

                    db.commit((err) => {
                      if (err) {
                        return db.rollback(() => {
                          res.status(500).json({ error: 'Erro ao finalizar pedido' });
                        });
                      }

                      res.status(201).json({
                        message: 'Pedido criado com sucesso!',
                        pedido_id: idPedido
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
};