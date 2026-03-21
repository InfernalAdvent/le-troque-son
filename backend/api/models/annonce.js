const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Photo = require('./photo'); // importe le modèle Photo

const Annonce = sequelize.define('annonces', { 
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: {type: DataTypes.INTEGER, allowNull: false},
    categorie_id: {type: DataTypes.INTEGER, allowNull: false},
    departement_numero: {type: DataTypes.STRING(3), allowNull: false},
    titre: {type: DataTypes.STRING(25), allowNull: false},
    description: {type: DataTypes.TEXT, allowNull: true},
    prix: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    etat: {type: DataTypes.STRING, allowNull: false},
    echange_souhaite_texte: {type: DataTypes.STRING(50), allowNull: true},
    echange_categorie_id: {type: DataTypes.INTEGER, allowNull: true},
    ville: {type: DataTypes.STRING(45), allowNull: false},
    code_postal: {type: DataTypes.STRING(5), allowNull: false},
    statut: {type: DataTypes.STRING, allowNull: false, defaultValue: 'Active'},
    date_publication: {type: DataTypes.DATE, defaultValue: DataTypes.NOW},
    deleted_at: { type: DataTypes.DATE, allowNull: true }
}, {
    paranoid: true,
    timestamps: true,
    createdAt: 'date_publication',
    updatedAt: false,
    deletedAt: 'deleted_at' // Lie explicitement ta colonne à Sequelize
});

module.exports = Annonce;
