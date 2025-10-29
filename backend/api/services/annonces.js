const { Annonce, Categorie } = require('../models');

const getAnnoncesByCategories = async(categorieId) => {
    return await Annonce.findAll({
        where: {
            categorie_id: categorieId
        },
        include: [
            {
                model: Categorie,
                as: 'categoriePrincipale',
                attributes: ['nom']
            }
        ]
    })
};

module.exports = {
    getAnnoncesByCategories
};