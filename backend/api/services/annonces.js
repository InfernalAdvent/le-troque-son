const { Op } = require('sequelize');
const { Annonce, User, Categorie, Departement } = require('../models'); 
const defaultService = require('./defaultService'); 
const categorieService = require('./categories'); 

// Service par défaut
const defaultAnnonceService = defaultService(Annonce);

// Définition des inclusions pour récupérer les relations
const AnnonceIncludes = [
    { model: User,
        as: "user",
        attributes: ['id','pseudo', "date_inscription", "derniere_connexion"] },
    { model: Categorie, 
        as: 'categoriePrincipale',
        attributes: ['id', 'nom'],
        include: [{ model: Categorie, as: 'parent', attributes: ['id', 'nom'] }] 
    },
    { model: Categorie,
        as: 'echangeCategorie',
        attributes: ['id', 'nom'] },
    { model: Departement,
        attributes: ['id', 'nom'] },
    // Ajouter Photo si nécessaire
];

const getAnnonceWithUser = async (id) => {
    return await Annonce.findOne({
        where: {id},
        include: AnnonceIncludes
    });
};

// 🔹 Récupération de toutes les annonces avec filtres (départements + recherche)
const getAllWithFilters = async ({ departements, search }) => {
    const where = {};

    if (departements) {
        where.departement_numero = { [Op.in]: departements.split(",") };
    }

    if (search) {
        where.titre = { [Op.like]: `%${search}%` };
    }

    return await Annonce.findAll({
        where,
        include: AnnonceIncludes,
        order: [["date_publication", "DESC"]],
    });
};

// 🔹 Met à jour une annonce en vérifiant que l'utilisateur est l'auteur
const updateAnnonceOwner = async (id, data, userId) => {
    const [rowsAffected] = await Annonce.update(data, {
        where: { id, user_id: userId }
    });

    if (rowsAffected === 0) return null;

    return await Annonce.findByPk(id, { include: AnnonceIncludes });
};

// 🔹 Récupère les annonces par catégorie (et sous-catégories si besoin)
const getAnnoncesByCategories = async (categoryId, filterCategoryId = null) => {
    const numCategoryId = parseInt(categoryId, 10);
    if (isNaN(numCategoryId)) return [];

    let finalCategoryIds = [];

    if (filterCategoryId) {
        const numFilterId = parseInt(filterCategoryId, 10);
        if (isNaN(numFilterId)) return [];
        finalCategoryIds = [numFilterId];
    } else {
        const descendantIds = await categorieService.getAllDescendantIds(numCategoryId);
        finalCategoryIds = [numCategoryId, ...descendantIds];
    }

    return await Annonce.findAll({
        where: { categorie_id: { [Op.in]: finalCategoryIds } },
        include: AnnonceIncludes,
        order: [['date_publication', 'DESC']]
    });
};

// 🔹 Recherche annonces par titre
const searchAnnonces = async (titre) => {
    return await Annonce.findAll({
        where: { titre: { [Op.like]: `%${titre}%` } },
        limit: 20,
    });
};

module.exports = {
    defaultAnnonceService,
    getAllWithFilters,
    getAnnoncesByCategories,
    updateAnnonceOwner,
    searchAnnonces,
    getAnnonceWithUser
};
