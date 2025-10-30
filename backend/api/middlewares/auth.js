// middlewares/auth.js (MODIFIÉ pour lire le cookie)

const jwt = require('jsonwebtoken');

const verifyCookieToken = (req, res, next) => {
    // 1. Récupérer le jeton à partir du cookie
    // Grâce à app.js et cookie-parser, req.cookies.jwt est disponible
    const token = req.cookies.jwt; 
    
    // Si pas de jeton, renvoie 401 (Unauthorized)
    if (!token) {
        return res.status(401).json({ message: "Accès refusé. Jeton non fourni (manque le cookie)." });
    }

    // 2. Vérifier le jeton
    try {
        // Décoder le jeton
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Ajouter les données de l'utilisateur à l'objet req 
        req.user = decoded; 
        
        // 3. Passer au contrôleur suivant
        next(); 
        
    } catch (err) {
        // Jeton invalide (expiré, falsifié), renvoie 403 (Forbidden)
        return res.status(403).json({ message: "Jeton invalide ou expiré." });
    }
};

module.exports = verifyCookieToken;