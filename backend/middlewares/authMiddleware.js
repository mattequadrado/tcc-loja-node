const autenticado = (req, res, next) => {
  if (!req.session.usuario) {
    return res.status(401).json({ error: 'Não está logado' });
  }
  next()
};

const apenasAdmin = (req, res, next) => {
  if (!req.session.usuario) {
    return res.status(401).json({ error: 'Não está logado' });
  }

  if (req.session.usuario.tipo !== 'admin') {
    return res.status(403).json({ error: 'Apenas admin' });
  }

  next();
};

module.exports = { autenticado, apenasAdmin };