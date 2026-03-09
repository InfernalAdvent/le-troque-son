const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Wishlist = sequelize.define('wishlist', { 
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    categorie_id:{ type: DataTypes.INTEGER, allowNull: true },
    souhait_texte:{ type: DataTypes.STRING, allowNull: true },
    date_ajout: {type: DataTypes.DATE, defaultValue: DataTypes.NOW}
});

module.exports = Wishlist;