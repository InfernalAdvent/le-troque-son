const { Annonce, Photo, Wishlist } = require('../models');

const deletePhotoByOwner = async (photoId, userId) => {
    try {
        const photo = await Photo.findByPk(photoId);

        if (!photo) {
            return null;
        }

        let ownerId = null;

        if (photo.annonce_id) {
            const annonce = await Annonce.findByPk(photo.annonce_id, {
                attributes: ['utilisateur_id']
            });
            ownerId = annonce ? annonce.utilisateur_id : null;

        } else if (photo.wishlist_id) {
            const wishlist = await Wishlist.findByPk(photo.wishlist_id, {
                attributes: ['user_id']
            });
            ownerId = wishlist ? wishlist.user_id : null;
        }

        if (!ownerId || ownerId !== userId) {
            return null; 
        }

        await photo.destroy();
        return true;

    } catch (error) {
        throw new Error(`Erreur lors de la suppression de la photo: ${error.message}`);
    }
};

module.exports = {
    deletePhotoByOwner
};
