require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const sequelize = require('./database');
const PORT = process.env.PORT || 5000;

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const allowedOrigins = ['http://localhost:3000'];

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin: function (origin, callback) {
    console.log("CORS Origin:", origin);
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  }
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

 // index.js qui regroupe tous les modèles

sequelize.sync({ alter: true }) // alter: true pour mettre à jour la base sans supprimer les données
  .then(() => console.log('Modèles synchronisés !'))
  .catch(err => console.error('Erreur de synchronisation :', err));


module.exports = app;
