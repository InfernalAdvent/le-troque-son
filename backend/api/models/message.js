const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Message = sequelize.define('users', { 
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    conversation_id: { type: DataTypes.INTEGER, allowNull: false },
    expediteur_id:{ type: DataTypes.INTEGER, allowNull: false },
    contenu:{ type: DataTypes.TEXT, allowNull: false },
    date_envoi: {type: DataTypes.DATE, defaultValue: DataTypes.NOW},
    lu_par_destinataire: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
});

module.exports = Message;