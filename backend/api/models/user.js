const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('users', { 
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: {type: DataTypes.STRING, allowNull: false},
    prenom: {type: DataTypes.STRING, allowNull: true},
    email: {type: DataTypes.STRING, /* unique: true, */ allowNull: false},
    pseudo: {type: DataTypes.STRING, allowNull: false},
    password: {type: DataTypes.STRING, allowNull: false},
    telephone: {type: DataTypes.INTEGER(8), allowNull: true},
    departement_numero: {type: DataTypes.STRING(3), allowNull: false},
    adresse: {type: DataTypes.STRING, allowNull: false},
    ville: {type: DataTypes.STRING, allowNull: false},
    code_postal: {type: DataTypes.STRING(5), allowNull: false},
    date_inscription: {type: DataTypes.DATE, defaultValue: DataTypes.NOW},
    derniere_connexion: {type: DataTypes.DATE, allowNull: true, defaultValue: null}
});

module.exports = User;