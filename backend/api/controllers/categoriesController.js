const categoriesService = require('../services/categories');
const defaultController = require('./defaultController');
const logger = require('../logger');
const Joi = require('joi');

const categoryIdSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': "L'ID doit être un nombre.",
        'any.required': "L'ID de la catégorie est obligatoire."
    })
});

const categorieController = {
    ...defaultController(categoriesService), 
    
    getMainCategories: async (req, res) => {
        // Pas de params ni query à valider ici
        try {
            const categories = await categoriesService.getMainCategories();
            res.json(categories);
        } catch (error) {
            logger.error("Erreur récupération catégories principales:", error);
            res.status(500).json({ error: error.message });
        }
    },

    getChildCategories: async (req, res) => {
        const { error, value } = categoryIdSchema.validate({ id: parseInt(req.params.id, 10) });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const parentId = value.id;

        try {
            const categories = await categoriesService.getChildCategories(parentId);

            if (!categories || categories.length === 0) {
                return res.status(404).json({ error: "Aucune sous-catégorie trouvée pour cette catégorie." });
            }

            res.json(categories);
        } catch (error) {
            logger.error("Erreur récupération sous-catégories:", error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = categorieController;