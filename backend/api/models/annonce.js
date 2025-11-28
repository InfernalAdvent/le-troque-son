const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Annonce = sequelize.define('annonces', { 
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: {type: DataTypes.INTEGER, allowNull: false},
    categorie_id: {type: DataTypes.INTEGER, allowNull: false},
    departement_numero: {type: DataTypes.STRING(3), allowNull: false},
    titre: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.TEXT, allowNull: true},
    prix: {type: DataTypes.DECIMAL(10,2), allowNull: true},
    etat: {type: DataTypes.STRING, allowNull: false},
    echange_souhaite_texte: {type: DataTypes.STRING, allowNull: true},
    echange_categorie_id: {type: DataTypes.INTEGER, allowNull: true},
    ville: {type: DataTypes.STRING, allowNull: false},
    code_postal: {type: DataTypes.STRING(5), allowNull: false},
    statut: {type: DataTypes.STRING, allowNull: false, defaultValue: 'Active'},
    date_publication: {type: DataTypes.DATE, defaultValue: DataTypes.NOW},
});

module.exports = Annonce;