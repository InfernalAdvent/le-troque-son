const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Departement } = require("../models");
const logger = require("../logger");
const crypto = require("crypto");
const { Op } = require("sequelize");

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
    { expiresIn: "1h" },
  );

  return { user, token };
};

const signup = async (email, password, userData) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error("Cet email est déjà utilisé.");
  }

  const { prenom, nom, pseudo, departement_numero } = userData;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = await User.create({
    prenom,
    nom,
    email,
    pseudo,
    password: hashedPassword,
    departement_numero,
  });

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  return { user: newUser, token };
};

const getCurrentUser = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
      include: {
        model: Departement,
        attributes: ["id", "nom", "numero"],
      },
    });
    return user;
  } catch (err) {
    logger.error("Erreur dans getCurrentUser:", err);
    throw err;
  }
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiration = new Date(Date.now() + 3600000);
  await user.update({ reset_token: token, reset_token_expiration: expiration });
  logger.info(
    `\n Lien de reset : http://localhost:5173/reset-password?token=${token}\n`,
  );
};

const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    where: {
      reset_token: token,
      reset_token_expiration: { [Op.gt]: new Date() },
    },
  });
  if (!user) {
    throw new Error("Token de réinitialisation invalide ou expiré.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  await user.update({
    password: hashedPassword,
    reset_token: null,
    reset_token_expiration: null,
  });
};

module.exports = {
  login,
  signup,
  getCurrentUser,
  forgotPassword,
  resetPassword,
};
