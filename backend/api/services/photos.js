const Photo  = require('../models/photo');

const photoService = {

    uploadPhotos: async (files, userId, annonceId = null) => {
        try {
            const savedPhotos = await Promise.all(
                files.map((file, index) =>
                    Photo.create({
                        user_id: userId,
                        annonce_id: annonceId,
                        url: "/uploads/" + file.filename,
                        ordre: index
                    })
                )
            );

            return savedPhotos;

        } catch (error) {
            throw new Error("Erreur lors du téléchargement des photos : " + error.message);
        }
    },

    getByAnnonceId: async (annonceId) => {
        return Photo.findAll({
            where: { annonce_id: annonceId },
            order: [["ordre", "ASC"]],
        });
    },
};

module.exports = photoService;