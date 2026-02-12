const annoncesService = require('../services/annonces');

const annonceController = {
    getAnnonceWithUser: async (req, res) => {
        try {
            const annonce = await annoncesService.getAnnonceWithUser(req.params.id);
            if(!annonce) {
                return res.status(404).json({ error: "Annonce introuvable"});
            }
            res.json(annonce);
            console.log(annonce.toJSON());
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur"});
        }
    },

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

    getAllWithFilters: async (req, res) => {
        try {
        const { departements, search } = req.query;
        const annonces = await annoncesService.getAllWithFilters({ departements, search });
        res.json(annonces);
        } catch (err) {
        console.error("Erreur filtres annonces :", err);
        res.status(500).json({ error: "Erreur serveur" });
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
        },
    
    searchAnnonces: async (req, res) => {
        const titre = req.query.titre || '';

        if(!titre.trim()) {
            return res.status(400).json({ error: 'Le paramètre titre est requis'});
        }
        try {
            const annonces = await annoncesService.searchAnnonces(titre);
            console.log("Résultats trouvés:", annonces);
            res.json(annonces);
        } catch(err) {
            console.error('Erreur lors de la recherche des annonces:', err);
            res.status(500).json({error: "Erreur serveur"});
        };
    },

    deleteAnnonce: async(req, res) => {
        try {
            const id = req.params.id;
            const userId = req.user ? req.user.id : null;
            if(!userId) {
                return res.status(401).json({ error: "Authentification requise pour supprimer cette annonce."});
            }
            const deletedAnnonce = await annoncesService.deleteAnnonce(id, userId);
            if (!deletedAnnonce) {
                return res.status(404).json({ message: 'Annonce non trouvée ou vous ne disposez les droits pour supprimer cette annonce'});
            }
            res.status(204).send();
        } catch (error) {
            console.error("Erreur lors de la suppression de l'annonce:", error);
            res.status(500).json({ error: error.message });
        };
    }
};

module.exports = annonceController;