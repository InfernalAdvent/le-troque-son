const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Annonce = sequelize.define('annonces', { 
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    utilisateur_id: {type: DataTypes.INTEGER, allowNull: false},
    categorie_id: {type: DataTypes.INTEGER, allowNull: false},
    departement_id: {type: DataTypes.INTEGER, allowNull: false},
    titre: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.TEXT, allowNull: true},
    prix: {type: DataTypes.DECIMAL(10,2), allowNull: true},
    etat: {type: DataTypes.STRING, allowNull: false},
    echange_souhaite_texte: {type: DataTypes.STRING, allowNull: true},
    echange_categorie_id: {type: DataTypes.INTEGER, allowNull: true},
    statut: {type: DataTypes.STRING, allowNull: false, defaultValue: 'Active'},
    date_publication: {type: DataTypes.DATE, defaultValue: DataTypes.NOW},
    date_mise_a_jour: {type: DataTypes.DATE, allowNull: false}
});

module.exports = Annonce;