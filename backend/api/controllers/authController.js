const authService = require('../services/auth');

const postLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { user, token } = await authService.login(email, password);
       
        res.cookie('jwt', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.status(200).json({ message: 'Connexion réussie' });

    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

const postSignUp = async (req, res) => {
    const { email, password, ...rest } = req.body; 

    // Validation basique (à améliorer)
    if (!email || !password) {
        return res.status(400).json({ message: "L'email et le mot de passe sont obligatoires." });
    }

    try {
        const { user, token } = await authService.signup(email, password, rest);

        res.cookie('jwt', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 3600000 
        });

        res.status(201).json({ 
            message: 'Inscription réussie et connexion établie.', 
            userId: user.id 
        });

    } catch (error) {
        if (error.message.includes("déjà utilisé")) {
            return res.status(409).json({ error: error.message });
        }
        console.error("Erreur d'inscription:", error);
        res.status(500).json({ error: "Erreur serveur lors de l'inscription." });
    }
};


const postLogout = (req, res) => {
    res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) }); 
    res.status(200).json({ message: 'Déconnexion réussie. Le token doit être supprimé côté client.' });
};

module.exports = { postLogin, postSignUp ,postLogout };