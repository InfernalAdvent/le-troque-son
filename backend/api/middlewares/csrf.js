const Tokens = require('csrf');
const tokens = new Tokens();

const csrfProtection = (req, res, next) => {
  // Utilise le secret existant du cookie, ou en génère un nouveau
  const secret = req.cookies._csrf_secret || tokens.secretSync();

  // Si le secret vient d'être généré, le stocker dans un cookie pour les prochaines requêtes
  if (!req.cookies._csrf_secret) {
    res.cookie('_csrf_secret', secret, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
  }

  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    if (!token || !tokens.verify(secret, token)) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
  }
  next();
};

const csrfToken = (req, res) => {
  const secret = req.cookies._csrf_secret || tokens.secretSync();
  if (!req.cookies._csrf_secret) {
    res.cookie('_csrf_secret', secret, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
  }
  const token = tokens.create(secret);
  res.json({ csrfToken: token });
};

module.exports = { csrfProtection, csrfToken };
