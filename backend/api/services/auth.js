const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

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

    const { prenom, nom, date_de_naissance, pays, departement_id } = userData;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
        prenom,
        nom,
        email,
        password: hashedPassword,
        date_de_naissance,
        pays,
        departement_id,
    });

    const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
    
    return { user: newUser, token };
};

module.exports = { login, signup };