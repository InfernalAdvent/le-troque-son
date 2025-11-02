const wishlistService = require('../services/wishlists');

const wishlistController = {
    updateWishlistOwner: async (req, res) => {
            try {
                const wishlistId = parseInt(req.params.id, 10);
                    
                    // L'ID de l'utilisateur est stocké par le middleware verifyToken dans req.user.id
                    const userId = req.user.id; 
    
                    if (isNaN(wishlistId) || isNaN(userId)) {
                        return res.status(400).json({ message: 'ID invalide.' });
                    }
    
                    const updatedElement = await wishlistService.updateWishlistOwner(wishlistId, req.body, userId);
                    
                    if (!updatedElement) {
                        // Le message 404 est correct car l'élément n'est pas "trouvé" pour CET utilisateur
                        return res.status(404).json({ message: "Wishlist non trouvée ou vous n'êtes pas l'auteur."});
                    }
                    
                    res.status(200).json(updatedElement);
                    
                } catch (error) {
                    console.error("Erreur lors de la mise à jour de la wishlist:", error);
                    // On peut renvoyer 403 Forbidden si l'erreur est clairement liée à l'accès
                    res.status(500).json({ error: error.message}); 
                };
            }
}

module.exports = wishlistController;