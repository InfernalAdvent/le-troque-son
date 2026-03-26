require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const loggerMorgan = require('morgan');
const cors = require('cors');
const sequelize = require('./database');
const logger = require('./logger');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const Tokens = require('csrf');
const tokens = new Tokens();
const PORT = process.env.PORT || 5000;

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const departementsRouter = require('./routes/departements');
const annoncesRouter = require('./routes/annonces');
const categoriesRouter = require('./routes/categories');
const wishlistsRouter = require('./routes/wishlists')
const authRouter = require('./routes/auth');
const photosRouter = require('./routes/photos');
const conversationsRouter = require('./routes/conversations');
const allowedOrigins = ['http://localhost:5000', 'http://localhost:5173'];

const app = express();

// Sécurité : Headers sécurisés (CSP, etc.)
app.use(helmet({
  crossOriginResourcePolicy: false // Désactive CORP pour permettre les images cross-origin
}));

// CORS AVANT tout (important pour les fichiers statiques et les requêtes cross-origin)
app.use(cors({
  origin: function (origin, callback) {
    // Permettre les requêtes sans origin (comme les outils de dev) et les origins autorisées
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(loggerMorgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Middleware CSRF : Génère un secret et vérifie le token pour les requêtes non-GET
app.use((req, res, next) => {
  // Génère un secret si pas présent
  if (!req.cookies._csrf_secret) {
    res.cookie('_csrf_secret', tokens.secretSync(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
  }
  const secret = req.cookies._csrf_secret;

  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    if (!token || !tokens.verify(secret, token)) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Fichiers statiques AVANT le rate limiting pour éviter les blocages
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
}, express.static('uploads'));

// Rate limiting : Limite les requêtes pour éviter DoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limite les requêtes pour éviter les abus
  message: 'Trop de requêtes, réessayez plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/conversations') // Exclure les conversations du rate limit global
});
// Rate limiting spécifique pour la messagerie (polling toutes les 5s)
const messagingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Plus permissif pour le polling
  message: 'Trop de requêtes de messagerie, réessayez plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Appliquer le rate limit spécifique aux conversations
app.use('/conversations', messagingLimiter);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/departements', departementsRouter);
app.use('/annonces', annoncesRouter);
app.use('/categories', categoriesRouter);
app.use('/wishlist', wishlistsRouter);
app.use('/photos', photosRouter);
app.use('/auth', authRouter);
app.use('/conversations', conversationsRouter);

// Route pour obtenir le token CSRF
app.get('/csrf-token', (req, res) => {
  const secret = req.cookies._csrf_secret || tokens.secretSync();
  if (!req.cookies._csrf_secret) {
    res.cookie('_csrf_secret', secret, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
  }
  const token = tokens.create(secret);
  res.json({ csrfToken: token });
});

app.listen(PORT, () => {
  logger.info(`Serveur démarré sur le port ${PORT}`);
});

sequelize.sync({ alter: true }) // alter: true pour mettre à jour la base sans supprimer les données
  .then(() => logger.info('Modèles synchronisés !'))
  .catch(err => logger.error('Erreur de synchronisation :', err));

module.exports = app;
