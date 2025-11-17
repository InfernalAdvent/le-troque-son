const { Op } = require('sequelize');
const { Annonce, User, Categorie, Departement } = require('../models'); // Importation des Modèles requis
const defaultService = require('./defaultService'); // Importation du service par défaut
const categorieService = require('./categories'); // Importation du service catégorie pour la récursivité

const annonceDefaultService = defaultService(Annonce);

// Définition des inclusions pour la récupération des annonces
const AnnonceIncludes = [
    { model: User, attributes: ['id', 'nom', 'prenom'] },
    { model: Categorie, as: 'categoriePrincipale', attributes: ['id', 'nom'],
        include: [{
            model: Categorie,
            as: 'parent',
            attributes: ['id', 'nom']
        }]
     },
    { model: Categorie, as: 'echangeCategorie', attributes: ['id', 'nom'] },
    { model: Departement, attributes: ['id', 'nom'] },
    // Ajoutez ici l'inclusion des photos si vous en avez besoin, ex: { model: Photo, as: 'photos', attributes: ['url'] }
];

/**
 * Met à jour une annonce en vérifiant que l'utilisateur connecté en est bien l'auteur.
 */
const updateAnnonceOwner = async (id, data, userId) => {
    try {
        const [rowsAffected] = await Annonce.update(data, {
            where: { 
                id: id,
                user_id: userId
            }
        });

        if (rowsAffected === 0) {
            return null;
        }

        const updatedElement = await Annonce.findByPk(id, { include: AnnonceIncludes });
        
        return updatedElement;
        
    } catch (error) {
        throw new Error(`Erreur lors de la vérification et de la mise à jour de l'annonce: ${error.message}`);
    }
};

/**
 * Récupère les annonces selon la catégorie cliquée (navigation) et le filtre optionnel (sous-catégorie).
 * Cette méthode utilise la recherche récursive sur la table Categorie via categorieService.
 * @param {number} categoryId - L'ID de la catégorie cliquée (navigation ou catégorie principale).
 * @param {number | null} filterCategoryId - L'ID de la sous-catégorie utilisée comme filtre précis.
 * @returns {Array<object>} Liste des annonces correspondantes.
 */
const getAnnoncesByCategories = async(categoryId, filterCategoryId = null) => {
    try {
        const numCategoryId = parseInt(categoryId, 10);
        if (isNaN(numCategoryId)) {
            throw new Error("L'ID de catégorie fourni n'est pas valide.");
        }
        
        let finalCategoryIds = [];
        
        if (filterCategoryId) {
            // Logique de Filtrage (Filtrage précis par sous-catégorie)
            const numFilterId = parseInt(filterCategoryId, 10);
            if (isNaN(numFilterId)) {
                throw new Error("L'ID de filtre fourni n'est pas un nombre valide.");
            }
            finalCategoryIds = [numFilterId];

        } else {
            // Logique de Navigation (Catégorie cliquée, inclut tous les descendants)
            // 1. Récupérer tous les IDs descendants (enfants, petits-enfants) de la catégorie cliquée.
            const descendantIds = await categorieService.getAllDescendantIds(numCategoryId);

            // 2. Le résultat final inclut la catégorie cliquée elle-même plus tous ses descendants.
            finalCategoryIds = [numCategoryId, ...descendantIds];
        }
        
        if (finalCategoryIds.length === 0) {
             // Si la liste est vide (ID de filtre incorrect, etc.)
             return []; 
        }

        // Exécuter la requête Annonce en utilisant l'opérateur [Op.in]
        return await Annonce.findAll({
            where: {
                // Chercher les annonces dont la categorie_id est DANS la liste des IDs ciblés
                categorie_id: { [Op.in]: finalCategoryIds }
            },
            include: AnnonceIncludes,
            order: [['date_publication', 'DESC']]
        });
        
    } catch (error) {
        console.error("Erreur dans getAnnoncesByCategories (Service):", error);
        throw new Error(`Erreur lors de la récupération des annonces par catégorie : ${error.message}`);
    }
};

const searchAnnonces = async(titre) => {
    return await Annonce.findAll({
        where: {
            titre: {
                [Op.like]: `%${titre}%`
            }
        },
        limit: 20,
    });
};

// Exportation de toutes les méthodes (celles par défaut et celles spécifiques)
module.exports = {
    annonceDefaultService, 
    getAnnoncesByCategories, 
    updateAnnonceOwner,
    searchAnnonces
};
