const winston = require('winston');
const path = require('path');
const fs = require('fs');

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}
// Configuration du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info', // Niveau par défaut : info
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json() // Format JSON pour une analyse facile
  ),
  transports: [
    // Logs d'erreur dans un fichier séparé
    new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
    // Tous les logs dans un fichier général
    new winston.transports.File({ filename: path.join(logsDir, 'combined.log') }),
  ],
});

// En développement, ajouter les logs à la console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;