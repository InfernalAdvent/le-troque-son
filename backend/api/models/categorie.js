const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Categorie = sequelize.define('users', { 
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    parent_id:{ type: DataTypes.INTEGER, allowNull: true },
    date_creation: {type: DataTypes.DATE, defaultValue: DataTypes.NOW}
});

module.exports = Categorie;