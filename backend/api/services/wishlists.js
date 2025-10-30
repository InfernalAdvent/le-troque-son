const { Wishlist } = require('../models');
const defaultService = require('./defaultService');

const wishlistDefaultService = defaultService(Wishlist);

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

const deleteWishlistOwner= async(id, userId) => {
        try {
            const whereOwner = {id: id}
            if(userId) {
                whereOwner.user_id = userId
            }
            const rowsDeleted = await Wishlist.destroy({ 
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
    updateWishlistOwner, deleteWishlistOwner
};