const { Annonce, Categorie } = require('../models');
const defaultService = require('./defaultService');

const annonceDefaultService = defaultService(Annonce);

const updateAnnonceOwner = async (id, data, userId) => {
    try {
       
        const [rowsAffected] = await Annonce.update(data, {
            where: { 
                id: id,
                utilisateur_id: userId
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

    const deleteAnnonceOwner= async(id, userId) => {
        try {
            const whereOwner = {id: id}
            if(userId) {
                whereOwner.utilsateur_id = userId
            }
            const rowsDeleted = await Annonce.destroy({ 
                where: whereOwner
            });

            if (rowsDeleted === 0) {
                return null; 
            } 
            
            return true; 

        } catch (error) {
            throw new Error(`Erreur lors de la suppression de l'annonce : ${error.message}`);
        };
    }

module.exports = {
    getAnnoncesByCategories, updateAnnonceOwner, deleteAnnonceOwner
};