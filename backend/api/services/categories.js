const { Op } = require('sequelize');
const { Categorie } = require('../models');
const defaultService = require('./defaultService');

// Nous utilisons les méthodes du defaultService et nous ajoutons nos propres méthodes spécialisées
const categorieService = {
    ...defaultService(Categorie), 
    
    /**
     * Récupère toutes les catégories de niveau racine (parent_id est NULL).
     * @returns {Array<object>} Liste des catégories racines.
     */
    getMainCategories: async () => {
        try {
            return await Categorie.findAll({
                where: { parent_id: null },
                order: [['nom', 'ASC']]
            });
        } catch (error) {
            console.error("Erreur dans getMainCategories:", error);
            throw new Error(`Erreur lors de la récupération des catégories principales : ${error.message}`);
        }
    },

    /**
     * Récupère toutes les sous-catégories pour un parent_id donné.
     * @param {number} parentId - L'ID de la catégorie parent.
     * @returns {Array<object>} Liste des sous-catégories.
     */
    getChildCategories: async (parentId) => {
        try {
            // S'assurer que parentId est un nombre valide
            const numParentId = parseInt(parentId, 10);
            if (isNaN(numParentId)) {
                throw new Error("L'ID parent fourni n'est pas un nombre valide.");
            }

            return await Categorie.findAll({
                where: { parent_id: numParentId },
                order: [['nom', 'ASC']]
            });
        } catch (error) {
            console.error("Erreur dans getChildCategories:", error);
            throw new Error(`Erreur lors de la récupération des sous-catégories : ${error.message}`);
        }
    },

    /**
     * Récupère récursivement tous les IDs descendants (enfants, petits-enfants, etc.) d'un parent.
     * @param {number} categoryId - L'ID de la catégorie de départ.
     * @returns {Array<number>} Liste des IDs descendants.
     */
    getAllDescendantIds: async (categoryId) => {
        const descendantIds = new Set();
        const stack = [categoryId];

        while (stack.length > 0) {
            const currentId = stack.pop();
            
            // 1. Récupérer les enfants directs
            const children = await Categorie.findAll({
                where: { parent_id: currentId },
                attributes: ['id'],
                raw: true // Pour obtenir un tableau de résultats simples
            });

            // 2. Ajouter les IDs au Set et à la pile pour la prochaine itération
            children.forEach(child => {
                if (!descendantIds.has(child.id)) {
                    descendantIds.add(child.id);
                    stack.push(child.id);
                }
            });
        }

        return Array.from(descendantIds);
    }
};

module.exports = categorieService;
