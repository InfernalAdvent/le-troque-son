const { Op } = require('sequelize');
const Photo  = require('../models/photo');
const Annonce = require('../models/annonce');
const { uploadToCloudinary } = require('../middlewares/upload');


const checkAnnonceOwnership = async (annonceId, userId) => {
        const annonce = await Annonce.findByPk(annonceId);
        if (!annonce) {
            throw new Error("Annonce non trouvée");
        }
        if (annonce.user_id !== userId) {
            throw new Error("Vous n'êtes pas le propriétaire de cette annonce");
        }
    };

const photoService = {

    getAllPublic: async () => {
        return Photo.findAll({
            where: { annonce_id: { [Op.ne]: null } },
            attributes: ['id', 'annonce_id', 'url', 'ordre'],
            order: [['ordre', 'ASC']]
        });
    },

    uploadPhotos: async (files, userId, annonceId = null) => {
        try {
            if (annonceId) {
                await checkAnnonceOwnership(annonceId, userId);
            }
            const savedPhotos = await Promise.all(
                files.map((file, index) =>
                    uploadToCloudinary(file.buffer, 'annonces').then(result => 
                        Photo.create({
                            user_id: userId,
                            annonce_id: annonceId,
                            url: result.secure_url,
                            ordre: index
                        })
                    )
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
    updateOrder: async (photoIds, annonceId, userId) => {
        try {
            await checkAnnonceOwnership(annonceId, userId); // Vérifier la propriété de l'annonce

            // Vérifier que toutes les photos appartiennent bien à l'annonce
            const photos = await Photo.findAll({
                where: { annonce_id: annonceId }
            });

            const photoIdsInDb = photos.map(p => p.id);

            // Mettre à jour l'ordre de chaque photo
            await Promise.all(
                photoIds.map(({ id, ordre }) => {
                    // Sécurité : vérifier que la photo appartient bien à l'annonce
                    if (!photoIdsInDb.includes(id)) {
                        throw new Error(`Photo ${id} n'appartient pas à l'annonce ${annonceId}`);
                    }
                    
                    return Photo.update(
                        { ordre },
                        { where: { id, annonce_id: annonceId } }
                    );
                })
            );

            return { message: "Ordre mis à jour avec succès" };

        } catch (error) {
            throw new Error("Erreur lors de la mise à jour de l'ordre : " + error.message);
        }
    },
};

module.exports = photoService;