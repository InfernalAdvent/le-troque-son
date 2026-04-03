const wishlistService = require('../services/wishlists');
const { Wishlist } = require('../models');
const logger = require('../logger');
const Joi = require('joi');

const updateWishlistSchema = Joi.object({
    souhait_texte: Joi.string().max(2000).optional().allow('').messages({
        'string.max': 'Le souhait ne doit pas dépasser 2000 caractères.'
    })
});

const createWishlistSchema = Joi.object({
    souhait_texte: Joi.string().max(2000).allow('', null).optional().messages({
        'string.max': 'Le souhait ne doit pas dépasser 2000 caractères.'
    })
});

const wishlistController = {
    createWishlist: async (req, res) => {
        const { error, value } = createWishlistSchema.validate(req.body, { stripUnknown: true });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        if (!req.user?.id) {
            return res.status(401).json({ error: "Utilisateur non identifié." });
        }

        value.user_id = req.user.id;

        try {
            const newWishlist = await Wishlist.create(value);
            res.status(201).json(newWishlist);
        } catch (err) {
            logger.error("Erreur lors de la création de la wishlist:", err);
            res.status(400).json({ error: "Erreur lors de la création de la wishlist." });
        }
    },
    updateWishlistOwner: async (req, res) => {
        const { error, value } = updateWishlistSchema.validate(req.body, { stripUnknown: true });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
            try {
                const wishlistId = parseInt(req.params.id, 10);
                    
                    // L'ID de l'utilisateur est stocké par le middleware verifyToken dans req.user.id
                    const userId = req.user.id; 
    
                    if (isNaN(wishlistId) || isNaN(userId)) {
                        return res.status(400).json({ message: 'ID invalide.' });
                    }
    
                    const updatedElement = await wishlistService.updateWishlistOwner(wishlistId, value, userId);
                    
                    if (!updatedElement) {
                        // Le message 404 est correct car l'élément n'est pas "trouvé" pour CET utilisateur
                        return res.status(404).json({ message: "Wishlist non trouvée ou vous n'êtes pas l'auteur."});
                    }
                    
                    res.status(200).json(updatedElement);
                    
                } catch (error) {
                    logger.error("Erreur lors de la mise à jour de la wishlist:", error);
                    res.status(500).json({ error: "Erreur serveur lors de la mise à jour." }); 
                };
            }
}

module.exports = wishlistController;