const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const saltRounds = 10; 

const login = async (email, password) => {
    // 1. Trouver l'utilisateur
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new Error("Email ou mot de passe incorrect.");
    }

    // 2. Comparer le mot de passe haché
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Email ou mot de passe incorrect.");
    }

    // 3. Créer le jeton JWT
    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET, // Clé secrète définie dans votre .env
        { expiresIn: '1h' }     // Le jeton expire après 1 heure
    );

    return { user, token };
};

// Fonction d'Inscription (Signup)
const signup = async (email, password, userData) => {
    // 1. Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new Error("Cet email est déjà utilisé.");
    }

    const { prenom, nom, date_de_naissance, pays, departement_id } = userData;
    // 2. Hacher le mot de passe (point clé de la sécurité)
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Créer l'utilisateur dans la base de données
    const newUser = await User.create({
        prenom,
        nom,
        email,
        password: hashedPassword,
        date_de_naissance,
        pays,
        departement_id,
    });

    // 4. Générer un token pour connecter l'utilisateur immédiatement après l'inscription
    const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
    
    return { user: newUser, token };
};

module.exports = { login, signup };