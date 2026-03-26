const logger = require('../logger');
const Joi = require('joi');

const idSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': "L'ID doit être un nombre.",
        'any.required': "L'ID est obligatoire."
    })
});

const userIdSchema = Joi.object({
    userId: Joi.number().integer().positive().required().messages({
        'number.base': "Le userId doit être un nombre.",
        'any.required': "Le paramètre userId est requis."
    })
});

const defaultController = (service) => ({

    getAll: async (req, res) => {
        try {
            const data = await service.getAll();
            res.json(data);
        } catch (error) {
            logger.error("Erreur lors de la récupération des données:", error);
            res.status(500).json({ error: "Erreur serveur lors de la récupération des données." });
        }
    },

    getById: async (req, res) => {
        const { error, value } = idSchema.validate({ id: parseInt(req.params.id, 10) });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        try {
            const item = await service.getById(value.id);
            if (!item) {
                return res.status(404).json({ error: "Ressource non trouvée." });
            }
            res.json(item);
        } catch (error) {
            logger.error("Erreur lors de la récupération de l'élément:", error);
            res.status(500).json({ error: "Erreur serveur." });
        }
    },

    getByUserId: async (req, res) => {
        const { error, value } = userIdSchema.validate({ userId: parseInt(req.params.userId, 10) });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        try {
            const entries = await service.getByUserId(value.userId);
            if (!entries || entries.length === 0) {
                return res.status(404).json({ error: "Ressources non trouvées." });
            }
            res.json(entries);
        } catch (error) {
            logger.error("Erreur lors de la récupération par userId:", error);
            res.status(500).json({ error: "Erreur serveur." });
        }
    },

    add: async (req, res) => {
        if (!req.user?.id) {
            return res.status(401).json({ error: "Utilisateur non identifié après l'authentification." });
        }

        req.body.user_id = req.user.id;

        try {
            const newElement = await service.add(req.body);
            res.status(201).json(newElement);
        } catch (error) {
            logger.error("Erreur lors de l'ajout:", error);
            res.status(400).json({ error: error.message });
        }
    },

    update: async (req, res) => {
        const { error, value } = idSchema.validate({ id: parseInt(req.params.id, 10) });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        try {
            const updatedElement = await service.update(value.id, req.body);
            if (!updatedElement) {
                return res.status(404).json({ message: "Élément non trouvé." });
            }
            res.status(200).json(updatedElement);
        } catch (error) {
            logger.error("Erreur lors de la mise à jour:", error);
            res.status(500).json({ error: error.message });
        }
    },

    delete: async (req, res) => {
        const { error, value } = idSchema.validate({ id: parseInt(req.params.id, 10) });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Authentification requise pour supprimer cet élément." });
        }

        try {
            const deletedElement = await service.delete(value.id, userId);
            if (!deletedElement) {
                return res.status(404).json({ message: "Élément non trouvé ou vous ne disposez pas des droits pour supprimer cet élément." });
            }
            res.status(204).send();
        } catch (error) {
            logger.error("Erreur lors de la suppression de l'élément:", error);
            res.status(500).json({ error: error.message });
        }
    }
});

module.exports = defaultController;