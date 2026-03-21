const { DataTypes, BOOLEAN } = require('sequelize');
const sequelize = require('../database');

const Conversation = sequelize.define('conversations', { 
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    annonce_id: { type: DataTypes.INTEGER, allowNull: false },
    utilisateur_initiateur_id:{ type: DataTypes.INTEGER, allowNull: false },
    utilisateur_receveur_id:{ type: DataTypes.INTEGER, allowNull: false },
    date_creation: {type: DataTypes.DATE, defaultValue: DataTypes.NOW},
    date_derniere_activite: {type: DataTypes.DATE, allowNull: false},
    masquee_par_initiateur: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    masquee_par_receveur: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    
});

module.exports = Conversation;