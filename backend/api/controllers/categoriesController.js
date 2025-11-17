const categoriesService = require('../services/categories');
const defaultController = require('./defaultController');

const categorieController = {
    ...defaultController(categoriesService), 
    
    /**
     * Répond à GET /categories/main
     */
    getMainCategories: async (req, res) => {
        try {
            const categories = await categoriesService.getMainCategories();
            res.json(categories);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Répond à GET /categories/:id/children
     */
    getChildCategories: async (req, res) => {
        try {
            const parentId = req.params.id;
            const categories = await categoriesService.getChildCategories(parentId);
            res.json(categories);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = categorieController;
