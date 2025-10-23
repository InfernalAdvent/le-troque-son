const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('users', { 
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: {type: DataTypes.STRING, allowNull: false},
    prenom: {type: DataTypes.STRING, allowNull: true},
    email: {type: DataTypes.STRING, unique: true, allowNull: false},
    mot_de_passe: {type: DataTypes.STRING, allowNull: false},
    date_naissance: {type: DataTypes.DATE, allowNull: true},
    pays: {type: DataTypes.STRING, allowNull: false, defaultValue: 'France'},
    departement_id: {type: DataTypes.INTEGER, allowNull: true},
    ville: {type: DataTypes.STRING, allowNull: true},
    code_postal: {type: DataTypes.STRING, allowNull: false},
    date_inscription: {type: DataTypes.DATE, defaultValue: DataTypes.NOW}
});

module.exports = User;