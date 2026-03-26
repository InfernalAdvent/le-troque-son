const authService = require('../services/auth');
const logger = require('../logger');
const Joi = require('joi');

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': "L'email doit être valide.",
        'string.empty': "L'email est requis."
    }),
    password: Joi.string().min(1).required().messages({
        'string.empty': "Le mot de passe est requis."
    })
});

const postLogin = async (req, res) => {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const { email, password } = value;
    logger.debug("Tentative de login:", email);

    try {
        const { user, token } = await authService.login(email, password);
        logger.debug("User trouvé:", user ? "OUI" : "NON");

        await user.update({
            derniere_connexion: new Date()
        });
       
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict' });
        res.status(200).json({ message: 'Connexion réussie' });
        

    } catch (error) {
        res.status(401).json({ error: error.message });
    }
    
};

const signUpSchema = Joi.object({
    prenom: Joi.string().required().messages({
        'string.empty': "Le prénom est requis."
    }),
    nom: Joi.string().required().messages({
        'string.empty': "Le nom est requis."
    }),
    pseudo: Joi.string().required().messages({
        'string.empty': "Le pseudo est requis."
    }),
    email: Joi.string().email().required().messages({
        'string.email': "L'email doit être valide.",
        'string.empty': "L'email est requis."
    }),
    password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Z])(?=.*[0-9])/)
    .required()
    .messages({
        'string.min': "Le mot de passe doit faire au moins 8 caractères.",
        'string.empty': "Le mot de passe est requis."
    }),
    departement_numero: Joi.string().required().messages({
        'string.empty': "Le numéro de département est requis."
    })
});

const postSignUp = async (req, res) => {
    const { error, value } = signUpSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const { email, password, ...rest } = value;

    try {
        const { user, token } = await authService.signup(email, password, rest);

        res.cookie('jwt', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 3600000,
            sameSite : 'Strict' 
        });

        res.status(201).json({ 
            message: 'Inscription réussie et connexion établie.', 
            userId: user.id 
        });

    } catch (error) {
        if (error.message.includes("déjà utilisé")) {
            return res.status(409).json({ error: error.message });
        }
        logger.error("Erreur d'inscription:", error);
        res.status(500).json({ error: "Erreur serveur lors de l'inscription." });
    }
};


const postLogout = (req, res) => {
    res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) }); 
    res.status(200).json({ message: 'Déconnexion réussie.' });
};

const me = async (req, res) => {
    try {
        const user = await authService.getCurrentUser(req.user.id);
        if (!user) {
            return res.status(404).json({ message : "Utilisateur non trouvé" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

module.exports = { postLogin, postSignUp, postLogout, me };