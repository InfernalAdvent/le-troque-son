const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('users', { 
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING(25), allowNull: false },
    prenom: { type: DataTypes.STRING(20), allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false },
    pseudo: { type: DataTypes.STRING(15), allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
    departement_numero: { type: DataTypes.STRING(3), allowNull: true },
    avatar_url: { type: DataTypes.STRING, allowNull: true },
    avatar_public_id: { type: DataTypes.STRING, allowNull: true },
    date_inscription: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    derniere_connexion: { type: DataTypes.DATE, allowNull: true, defaultValue: null }
});

module.exports = User;