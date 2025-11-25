const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Departement } = require('../models');

const saltRounds = 10; 

const login = async (email, password) => {
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new Error("Email ou mot de passe incorrect.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Email ou mot de passe incorrect.");
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }   
    );

    return { user, token };
};


const signup = async (email, password, userData) => {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new Error("Cet email est déjà utilisé.");
    }

    const { 
            prenom, 
            nom, 
            pseudo,
            telephone,
            adresse,
            ville,
            code_postal,
            departement_id
        } = userData;    
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
        prenom,
        nom,
        email,
        pseudo,
        password: hashedPassword,
        telephone,
        adresse,
        ville,
        code_postal,
        departement_id,
    });

    const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
    
    return { user: newUser, token };
};

const getCurrentUser = async (userId) => {
    try {
        const user = await User.findByPk(userId, {
            attributes: { exclude: ["password"] },
            include: {
                model: Departement,
                attributes: ["id", "nom", "numero"]
            }
        });
        return user;
    } catch (err) {
        console.error("Erreur dans getCurrentUser:", err);
        throw err;
    }
};

module.exports = { login, signup, getCurrentUser };