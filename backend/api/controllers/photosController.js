const photoService = require("../services/photos");

const photoController = {

    upload: async (req, res) => {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: "Aucune photo reçue." });
            }

            const userId = req.user.id;
            const annonceId = req.body.annonce_id || null;

            const photos = await photoService.uploadPhotos(req.files, userId, annonceId);

            res.status(201).json(photos);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    getByAnnonceId: async (req, res) => {
        try {
            const { annonceId } = req.params;

            const photos = await photoService.getByAnnonceId(annonceId);

            res.json(photos);
        } catch (err) {
            console.error("Erreur récupération photos par annonce:", err);
            res.status(500).json({ message: "Erreur récupération photos"});
        }
    }, 

    updateOrder: async (req, res) => {
        try {
            const { annonceId } = req.params;
            const { photoIds } = req.body; // [{ id: 5, ordre: 0 }, { id: 3, ordre: 1 }, ...]

            console.log("🔍 Annonce ID:", annonceId);
            console.log("🔍 Photo IDs reçus:", photoIds);

            if (!photoIds || !Array.isArray(photoIds)) {
                return res.status(400).json({ error: "Format invalide pour photoIds" });
            }

            const result = await photoService.updateOrder(photoIds, annonceId);

            res.json(result);

        } catch (error) {
            console.error("Erreur mise à jour ordre photos:", error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = photoController;
