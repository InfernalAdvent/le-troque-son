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
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
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
  max: 10000, // Augmenté pour éviter les blocages en dev
  message: 'Trop de requêtes, réessayez plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/departements', departementsRouter);
app.use('/annonces', annoncesRouter);
app.use('/categories', categoriesRouter);
app.use('/wishlist', wishlistsRouter);
app.use('/photos', photosRouter);
app.use('/auth', authRouter);
app.use('/conversations', conversationsRouter);

app.listen(PORT, () => {
  logger.info(`Serveur démarré sur le port ${PORT}`);
});

sequelize.sync({ alter: true }) // alter: true pour mettre à jour la base sans supprimer les données
  .then(() => logger.info('Modèles synchronisés !'))
  .catch(err => logger.error('Erreur de synchronisation :', err));

module.exports = app;
