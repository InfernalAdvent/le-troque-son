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
    }

};

module.exports = photoController;
