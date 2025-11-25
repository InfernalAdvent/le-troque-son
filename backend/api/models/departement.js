const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Departement = sequelize.define('departements', { 
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    numero:{ type: DataTypes.STRING, allowNull: false, unique: true }
});

module.exports = Departement;