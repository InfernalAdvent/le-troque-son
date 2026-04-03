const { Wishlist } = require('../models');

const updateWishlistOwner = async (id, data, userId) => {
    try {
       
        const [rowsAffected] = await Wishlist.update(data, {
            where: { 
                id: id,
                user_id: userId
            }
        });

        if (rowsAffected === 0) {
            return null;
        }

        const updatedElement = await Wishlist.findByPk(id);
        
        return updatedElement;
        
    } catch (error) {
        throw new Error(`Erreur lors de la vérification et de la mise à jour de la wishlist: ${error.message}`);
    }
};

module.exports = {
    updateWishlistOwner
};