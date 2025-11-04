const annoncesService = require('../services/annonces');

const annonceController = {
    getAnnoncesByCategories:  async (req, res) => {
        const categorieId = req.params.id;

        try{
            const annonces = await annoncesService.getAnnoncesByCategories(categorieId);
            res.json(annonces);
        } catch (error) {
            console.error("Erreur lors de la récupérations des annonces:", error);
            res.status(500).json({error: "Erreur serveur"});
        }
    },

    updateAnnonceOwner: async (req, res) => {
        try {
            const annonceId = parseInt(req.params.id, 10);
                
                const userId = req.user.id; 

                if (isNaN(annonceId) || isNaN(userId)) {
                    return res.status(400).json({ message: 'ID invalide.' });
                }

                const updatedElement = await annoncesService.updateAnnonceOwner(annonceId, req.body, userId);
                
                if (!updatedElement) {
                    return res.status(404).json({ message: 'Annonce non trouvée ou vous n\'êtes pas l\'auteur.'});
                }
                
                res.status(200).json(updatedElement);
                
            } catch (error) {
                console.error("Erreur lors de la mise à jour de l'annonce:", error);
                res.status(500).json({ error: error.message}); 
            };
        }
};

module.exports = annonceController;