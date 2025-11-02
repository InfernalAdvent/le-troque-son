const { Annonce, Categorie } = require('../models');
const defaultService = require('./defaultService');

const annonceDefaultService = defaultService(Annonce);

const updateAnnonceOwner = async (id, data, userId) => {
    try {
       
        const [rowsAffected] = await Annonce.update(data, {
            where: { 
                id: id,
                user_id: userId
            }
        });

        if (rowsAffected === 0) {
            return null;
        }

        const updatedElement = await Annonce.findByPk(id);
        
        return updatedElement;
        
    } catch (error) {
        throw new Error(`Erreur lors de la vérification et de la mise à jour de l'annonce: ${error.message}`);
    }
};

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
    getAnnoncesByCategories, updateAnnonceOwner
};