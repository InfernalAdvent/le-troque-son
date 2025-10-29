// middleware/auth.middleware.js

const jwt = require('jsonwebtoken');

// 🚨 Assurez-vous d'avoir process.env.JWT_SECRET défini dans votre .env 🚨

const authenticateToken = (req, res, next) => {
    // 1. Récupérer le jeton
    // Le jeton est généralement envoyé dans l'en-tête 'Authorization' sous la forme 'Bearer <token>'
    const authHeader = req.headers['authorization'];
    
    // Extrait le token après 'Bearer '
    const token = authHeader && authHeader.split(' ')[1]; 

    // Si pas de jeton, renvoie 401 (Unauthorized)
    if (token == null) {
        return res.status(401).json({ message: "Accès refusé. Jeton non fourni." });
    }

    // 2. Vérifier le jeton
    try {
        // Décoder le jeton en utilisant la clé secrète
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Ajouter les données de l'utilisateur (id, email) à l'objet req 
        // pour que les contrôleurs suivants y aient accès (ex: req.user.id)
        req.user = decoded; 
        
        // 3. Passer au contrôleur suivant
        next(); 
        
    } catch (err) {
        // Si le jeton est invalide (expiré, falsifié), renvoie 403 (Forbidden)
        return res.status(403).json({ message: "Jeton invalide ou expiré." });
    }
};

module.exports = authenticateToken;