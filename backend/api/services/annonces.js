const { Op } = require('sequelize');
const { Annonce, User, Categorie, Departement, Photo } = require('../models'); 
const categorieService = require('./categories'); 

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
    { model: Departement,
        attributes: ['id', 'nom'] },
    { model: Photo,
        as: 'photos',
        attributes: ['id', 'url', 'ordre'],
        required: false },
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
        // 👇 Diviser la recherche en mots
        const mots = search.trim().split(/\s+/);
        
        const conditions = mots.map(mot => ({
            titre: { [Op.like]: `%${mot}%` },
        }));

        // 👇 Ajouter les conditions de recherche au where
        where[Op.and] = conditions;
    }

    return await Annonce.findAll({
        where,
        include: AnnonceIncludes,
        order: [["date_publication", "DESC"]],
    });
};

//  Met à jour une annonce en vérifiant que l'utilisateur est l'auteur
const updateAnnonceOwner = async (id, data, userId) => {
    const [rowsAffected] = await Annonce.update(data, {
        where: { id, user_id: userId }
    });

    if (rowsAffected === 0) return null;

    return await Annonce.findByPk(id, { include: AnnonceIncludes });
};

//  Récupère les annonces par catégorie (et sous-catégories si besoin)
const getAnnoncesByCategories = async (categoryId, filterCategoryId = null, departements = null) => {
    const numCategoryId = parseInt(categoryId, 10);
    if (isNaN(numCategoryId)) return [];

    let finalCategoryIds = [];

    if (filterCategoryId) {
        // Split la chaîne "3,4,5" en tableau [3, 4, 5]
        const filterIds = filterCategoryId.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
        
        if (filterIds.length === 0) return [];
        
        finalCategoryIds = filterIds; // 👈 Utilise TOUS les filtres
    } else {
        const descendantIds = await categorieService.getAllDescendantIds(numCategoryId);
        finalCategoryIds = [numCategoryId, ...descendantIds];
    }

    // Construire le where avec catégories
    const where = { 
        categorie_id: { [Op.in]: finalCategoryIds } 
    };

    // Ajouter les départements si présents
    if (departements) {
        where.departement_numero = { [Op.in]: departements.split(",") };
    }

    return await Annonce.findAll({
        where,
        include: AnnonceIncludes,
        order: [['date_publication', 'DESC']]
    });
};

//  Recherche annonces par titre
const searchAnnonces = async (titre) => {
    // Diviser la recherche en mots
    const mots = titre.trim().split(/\s+/); // Split sur les espaces
    
    // Créer une condition WHERE pour chaque mot
    const conditions = mots.map(mot => ({
        titre: { [Op.like]: `%${mot}%` },
    }));

    return await Annonce.findAll({
        where: {
            [Op.and]: conditions // Tous les mots doivent être présents
        },
        include: AnnonceIncludes, // N'oublie pas d'ajouter les includes si besoin
        limit: 20,
    });
};

const deleteAnnonce = async (id, userId) => {
  const whereOwner = { id };
  if (userId) whereOwner.user_id = userId;

  // 1. On effectue le soft delete de l'annonce
  // Sequelize va générer un : UPDATE annonces SET deleted_at = NOW() ...
  const rowsAffected = await Annonce.destroy({
    where: whereOwner,
    force: false 
  });

  if (rowsAffected > 0) {
    // 2. On supprime les photos de la base de données
    // Comme le modèle Photo n'est pas paranoid, Sequelize fait un DELETE FROM photos...
    await Photo.destroy({ 
      where: { annonce_id: id } 
    });
    return true;
  }

  return false;
};


const createAnnonce = async (data) => {
    return await Annonce.create(data);
};

const getByUserId = async (userId) => {
    return await Annonce.findAll({
        where: { user_id: userId },
        include: AnnonceIncludes,
        order: [['date_publication', 'DESC']],
    });
};

module.exports = {
    getAllWithFilters,
    getAnnoncesByCategories,
    updateAnnonceOwner,
    searchAnnonces,
    getAnnonceWithUser,
    deleteAnnonce,
    getByUserId,
    createAnnonce
};
