const photoService = require('../services/photos');

const photoController = {
    deletePhoto: async (req, res) => {
        const photoId = req.params.id;
        const userId = req.user.id; 

        if (photoId || !userId) {
            return res.status(400).json({ message: 'ID de photo invalide ou utilisateur non authentifié.' });
        }

        try {
            const isDeleted = await photoService.deletePhotoByOwner(photoId, userId);

            if (!isDeleted) {
                return res.status(403).json({ message: "Action non autorisée ou photo non trouvée."});
            }

            res.status(204).send();
            
        } catch (error) {
            console.error("Erreur lors de la suppression de la photo:", error);
            res.status(500).json({ error: error.message}); 
        }
    },
};

module.exports = photoController;
