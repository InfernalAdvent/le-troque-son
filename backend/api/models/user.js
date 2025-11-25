const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('users', { 
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: {type: DataTypes.STRING, allowNull: false},
    prenom: {type: DataTypes.STRING, allowNull: true},
    email: {type: DataTypes.STRING, /* unique: true, */ allowNull: false},
    pseudo: {type: DataTypes.STRING, allowNull: false},
    password: {type: DataTypes.STRING, allowNull: false},
    telephone: {type: DataTypes.INTEGER, allowNull: true},
    departement_id: {type: DataTypes.STRING, allowNull: false},
    adresse: {type: DataTypes.STRING, allowNull: false},
    ville: {type: DataTypes.STRING, allowNull: false},
    code_postal: {type: DataTypes.INTEGER, allowNull: false},
    date_inscription: {type: DataTypes.DATE, defaultValue: DataTypes.NOW},
    derniere_connexion: {type: DataTypes.DATE, allowNull: true, defaultValue: null}
});

module.exports = User;