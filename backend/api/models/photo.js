const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Photo = sequelize.define('photos', { 
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: {type: DataTypes.INTEGER, allowNull: false },
    annonce_id: { 
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "annonces",
            key: 'id'
        }},
    wishlist_id:{ type: DataTypes.INTEGER, allowNull: true },
    url:{ type: DataTypes.STRING, allowNull: false },
    ordre: { type: DataTypes.INTEGER, defaultValue: 0 },
    date_ajout: {type: DataTypes.DATE, defaultValue: DataTypes.NOW}
});

module.exports = Photo;