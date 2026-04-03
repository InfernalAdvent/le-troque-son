const annoncesService = require('../services/annonces');
const logger = require('../logger');
const Joi = require('joi');

// Schémas de validation pour les annonces
const updateAnnonceSchema = Joi.object({
    titre: Joi.string().min(5).max(100).required().messages({
        'string.min': 'Le titre doit contenir au moins 5 caractères.',
        'string.max': 'Le titre ne doit pas dépasser 100 caractères.',
        'any.required': 'Le titre est obligatoire.'
    }),
    description: Joi.string().min(1).max(2000).required().messages({
        'string.min': 'La description doit contenir au moins 1 caractère.',
        'string.max': 'La description ne doit pas dépasser 2000 caractères.',
        'any.required': 'La description est obligatoire.'
    }),
    prix: Joi.number().min(0).required().messages({
        'number.min': 'Le prix doit être supérieur ou égal à 0.',
        'any.required': 'Le prix est obligatoire.'
    }),
    categorie_id: Joi.number().integer().positive().optional().messages({
        'number.base': 'La catégorie doit être un nombre.'
    }),
    etat: Joi.string().valid('Comme neuf', 'Très bon état', 'Bon état', 'Usagé').optional(),
    echange_souhaite_texte: Joi.string().max(500).allow(null, '').optional(),
    ville: Joi.string().max(100).optional(),
    code_postal: Joi.string().pattern(/^\d{5}$/).optional().messages({
        'string.pattern.base': 'Le code postal doit être valide.'
    }),
    departement_numero: Joi.string().pattern(/^\d{2,3}$/).optional().messages({
        'string.pattern.base': 'Le numéro de département doit être valide.'
    })
});

const deleteAnnonceSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': 'L\'ID doit être un nombre.',
        'any.required': 'L\'ID de l\'annonce est obligatoire.'
    })
});

const searchSchema = Joi.object({
    titre: Joi.string().min(1).max(100).required().messages({
        'string.min': 'Le titre de recherche doit contenir au moins 1 caractère.',
        'string.max': 'Le titre de recherche ne doit pas dépasser 100 caractères.',
        'any.required': 'Le titre de recherche est obligatoire.'
    })
});

const filtersSchema = Joi.object({
    departements: Joi.string().pattern(/^\d{2,3}(,\d{2,3})*$/).optional().messages({
        'string.pattern.base': 'Les départements doivent être des numéros séparés par des virgules.'
    }),
    search: Joi.string().max(100).optional().messages({
        'string.max': 'La recherche ne doit pas dépasser 100 caractères.'
    })
});

const categoriesSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': 'L\'ID doit être un nombre.',
        'any.required': 'L\'ID de la catégorie est obligatoire.'
    })
});

const categoryFiltersSchema = Joi.object({
    filtres: Joi.string().pattern(/^\d+(,\d+)*$/).optional().messages({
        'string.pattern.base': 'Les filtres doivent être des IDs séparés par des virgules.'
    }),
    departements: Joi.string().pattern(/^\d{2,3}(,\d{2,3})*$/).optional().messages({
        'string.pattern.base': 'Les départements doivent être des numéros séparés par des virgules.'
    })
});

const createAnnonceSchema = Joi.object({
    titre: Joi.string().min(5).max(25).required().messages({
        'string.min': 'Le titre doit contenir au moins 5 caractères.',
        'string.max': 'Le titre ne doit pas dépasser 25 caractères.',
        'any.required': 'Le titre est obligatoire.'
    }),
    description: Joi.string().max(2000).allow('', null).optional(),
    prix: Joi.number().min(0).required().messages({
        'number.min': 'Le prix doit être supérieur ou égal à 0.',
        'any.required': 'Le prix est obligatoire.'
    }),
    categorie_id: Joi.number().integer().positive().required().messages({
        'number.base': 'La catégorie doit être un nombre.',
        'any.required': 'La catégorie est obligatoire.'
    }),
    etat: Joi.string().valid('Comme neuf', 'Très bon état', 'Bon état', 'Usagé').required().messages({
        'any.only': "L'état doit être l'une des valeurs autorisées.",
        'any.required': "L'état est obligatoire."
    }),
    echange_souhaite_texte: Joi.string().max(50).allow('', null).optional(),
    ville: Joi.string().max(45).required().messages({
        'any.required': 'La ville est obligatoire.'
    }),
    code_postal: Joi.string().pattern(/^\d{5}$/).required().messages({
        'string.pattern.base': 'Le code postal doit être valide (5 chiffres).',
        'any.required': 'Le code postal est obligatoire.'
    }),
    departement_numero: Joi.string().pattern(/^\d{2,3}$/).required().messages({
        'string.pattern.base': 'Le numéro de département doit être valide.',
        'any.required': 'Le département est obligatoire.'
    })
});

const annonceController = {
    createAnnonce: async (req, res) => {
        const { error, value } = createAnnonceSchema.validate(req.body, { stripUnknown: true });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        if (!req.user?.id) {
            return res.status(401).json({ error: "Utilisateur non identifié." });
        }

        value.user_id = req.user.id;

        try {
            const newAnnonce = await annoncesService.createAnnonce(value);
            res.status(201).json(newAnnonce);
        } catch (err) {
            logger.error("Erreur lors de la création de l'annonce:", err);
            res.status(400).json({ error: "Erreur lors de la création de l'annonce." });
        }
    },
    getAnnonceWithUser: async (req, res) => {
        try {
            const annonce = await annoncesService.getAnnonceWithUser(req.params.id);
            if(!annonce) {
                return res.status(404).json({ error: "Annonce introuvable"});
            }
            res.json(annonce);
            logger.debug("Annonce récupérée:", annonce.toJSON());
        } catch (err) {
            logger.error("Erreur récupération annonce:", err);
            res.status(500).json({ error: "Erreur serveur"});
        }
    },

    getAnnoncesByCategories: async (req, res) => {
        // Valider les params
        const { error: paramError } = categoriesSchema.validate({ id: req.params.id });
        if (paramError) {
            return res.status(400).json({ error: paramError.details[0].message });
        }

        // Valider les query params (filtres et départements)
        const { error: queryError, value: queryValue } = categoryFiltersSchema.validate(req.query, { stripUnknown: true });
        if (queryError) {
            return res.status(400).json({ error: queryError.details[0].message });
        }

        const categorieId = req.params.id;
        const { filtres, departements } = queryValue;

        try {
            const annonces = await annoncesService.getAnnoncesByCategories(
                categorieId,
                filtres,
                departements //  Passer au service
            );
            res.json(annonces);
        } catch (error) {
            logger.error("Erreur lors de la récupération des annonces:", error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },

    getAllWithFilters: async (req, res) => {
        // Valider les query params
        const { error } = filtersSchema.validate(req.query);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        try {
        const { departements, search } = req.query;
        const annonces = await annoncesService.getAllWithFilters({ departements, search });
        res.json(annonces);
        } catch (err) {
        logger.error("Erreur filtres annonces :", err);
        res.status(500).json({ error: "Erreur serveur" });
        }
    },

    updateAnnonceOwner: async (req, res) => {
        // Valider le body
        const { error, value } = updateAnnonceSchema.validate(req.body, { stripUnknown: true });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        try {
            const annonceId = parseInt(req.params.id, 10);
                
                const userId = req.user.id; 

                if (isNaN(annonceId) || isNaN(userId)) {
                    return res.status(400).json({ message: 'ID invalide.' });
                }

                const updatedElement = await annoncesService.updateAnnonceOwner(annonceId, value, userId);
                
                if (!updatedElement) {
                    return res.status(404).json({ message: 'Vous devez modifier votre annonce avant de l\'enregistrer.'});
                }
                
                res.status(200).json(updatedElement);
                
            } catch (error) {
                logger.error("Erreur lors de la mise à jour de l'annonce:", error);
                res.status(500).json({ error: "Erreur serveur lors de la mise à jour." }); 
            };
        },
    
    searchAnnonces: async (req, res) => {
        // Valider les query params
        const { error } = searchSchema.validate({ titre: req.query.titre });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        try {
            const titre = req.query.titre;
            const annonces = await annoncesService.searchAnnonces(titre);
            logger.debug("Résultats trouvés:", annonces);
            res.json(annonces);
        } catch(err) {
            logger.error('Erreur lors de la recherche des annonces:', err);
            res.status(500).json({error: "Erreur serveur"});
        };
    },

    deleteAnnonce: async(req, res) => {
        // Valider les params
        const { error } = deleteAnnonceSchema.validate({ id: parseInt(req.params.id, 10) });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        try {
            const id = req.params.id;
            const userId = req.user ? req.user.id : null;
            if(!userId) {
                return res.status(401).json({ error: "Authentification requise pour supprimer cette annonce."});
            }
            const deletedAnnonce = await annoncesService.deleteAnnonce(id, userId);
            if (!deletedAnnonce) {
                return res.status(404).json({ message: 'Annonce non trouvée ou vous ne disposez les droits pour supprimer cette annonce'});
            }
            res.status(204).send();
        } catch (error) {
            logger.error("Erreur lors de la suppression de l'annonce:", error);
            res.status(500).json({ error: "Erreur serveur lors de la suppression." });
        };
    },

    getByUserId: async (req, res) => {
        try {
            const userId = parseInt(req.params.userId, 10);
            if (isNaN(userId)) {
                return res.status(400).json({ error: "ID utilisateur invalide." });
            }
            const annonces = await annoncesService.getByUserId(userId);
            res.json(annonces);
        } catch (error) {
            logger.error("Erreur lors de la récupération des annonces de l'utilisateur:", error);
            res.status(500).json({ error: "Erreur serveur lors de la récupération des annonces." });
        }
    }
};

module.exports = annonceController;