// middlewares/auth.js
const jwt = require('jsonwebtoken');

const verifyToken = (token) => {
    if (!token) throw new Error('Token manquant');
    return jwt.verify(token, process.env.JWT_SECRET);
};

const verifyCookieToken = (req, res, next) => {
    const token = req.cookies.jwt;
    try {
        req.user = verifyToken(token);
        next();
    } catch {
        return res.status(401).json({ message: "Accès refusé." });
    }
};

// Middleware Socket.io
const verifySocketToken = (socket, next) => {
    const cookie = socket.handshake.headers.cookie;
    if (!cookie) return next(new Error('Non authentifié'));

    const token = cookie.split(';')
        .map(c => c.trim())
        .find(c => c.startsWith('jwt='))
        ?.split('=')[1];

    try {
        socket.userId = verifyToken(token).id;
        next();
    } catch {
        next(new Error('Token invalide'));
    }
};

module.exports = { verifyCookieToken, verifySocketToken };