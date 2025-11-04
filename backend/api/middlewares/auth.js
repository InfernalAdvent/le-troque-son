const jwt = require('jsonwebtoken');

const verifyCookieToken = (req, res, next) => {
    const token = req.cookies.jwt; 
    
    if (!token) {
        return res.status(401).json({ message: "Accès refusé. Jeton non fourni (manque le cookie)." });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded; 
        
        next(); 
        
    } catch (err) {
        return res.status(403).json({ message: "Jeton invalide ou expiré." });
    }
};

module.exports = verifyCookieToken;