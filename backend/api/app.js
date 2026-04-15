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
const { csrfProtection, csrfToken } = require('./middlewares/csrf');
const PORT = process.env.PORT || 5000;

const usersRouter = require('./routes/users');
const departementsRouter = require('./routes/departements');
const annoncesRouter = require('./routes/annonces');
const categoriesRouter = require('./routes/categories');
const wishlistsRouter = require('./routes/wishlists')
const authRouter = require('./routes/auth');
const photosRouter = require('./routes/photos');
const conversationsRouter = require('./routes/conversations');
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5000,http://localhost:5173').split(',');

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
app.use(csrfProtection);

app.use(express.static(path.join(__dirname, 'public')));

// Fichiers statiques AVANT le rate limiting pour éviter les blocages
app.use('/uploads', express.static('uploads'));

// Rate limiting : Limite les requêtes pour éviter DoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limite les requêtes pour éviter les abus
  message: 'Trop de requêtes, réessayez plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/conversations') || req.path.startsWith('/auth') // Exclure les routes avec leur propre rate limiter
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

// Rate limiting strict pour l'authentification (anti brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 tentatives max par IP
  message: 'Trop de tentatives de connexion, réessayez dans 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/auth/login', authLimiter);
app.use('/auth/signup', authLimiter);

// Appliquer le rate limit spécifique aux conversations
app.use('/conversations', messagingLimiter);

app.use('/users', usersRouter);
app.use('/departements', departementsRouter);
app.use('/annonces', annoncesRouter);
app.use('/categories', categoriesRouter);
app.use('/wishlist', wishlistsRouter);
app.use('/photos', photosRouter);
app.use('/auth', authRouter);
app.use('/conversations', conversationsRouter);

// Route pour obtenir le token CSRF
app.get('/csrf-token', csrfToken);

app.listen(PORT, () => {
  logger.info(`Serveur démarré sur le port ${PORT}`);
});

const syncOptions = process.env.NODE_ENV === 'production' ? {} : { alter: true };
sequelize.sync(syncOptions)
  .then(() => logger.info('Modèles synchronisés !'))
  .catch(err => logger.error('Erreur de synchronisation :', err));

module.exports = app;
