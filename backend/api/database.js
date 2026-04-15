const { Sequelize } = require('sequelize');
const logger = require('./logger');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,  
    port: process.env.DB_PORT,  
    dialect: 'mysql',
    define: {
      freezeTableName: true,
      timestamps: false,
    },
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    }
  }
);

sequelize.authenticate()
  .then(() => logger.info('Connexion à la base de données réussie.'))
  .catch(err => logger.error('Erreur de connexion :', err));

module.exports = sequelize;