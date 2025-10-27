// services/departements.js

const { Departement } = require('../models');
// Attention : le modèle Departement doit être exporté dans models/index.js pour cette ligne

const getAllDepartements = async () => {
    // CORRECTION : AJOUTER RETURN
    const departements = await Departement.findAll({
        attributes: ['numero', 'nom']
    });
    return departements; // <--- AJOUTER RETURN
};

module.exports = {
    getAllDepartements
};