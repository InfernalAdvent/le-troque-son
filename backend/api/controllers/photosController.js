const photoService = require("../services/photos");
const logger = require("../logger");
const Joi = require('joi');

const annonceIdSchema = Joi.object({
    annonceId: Joi.number().integer().positive().required().messages({
        'number.base': "L'ID de l'annonce doit être un nombre.",
        'any.required': "L'ID de l'annonce est obligatoire."
    })
});

const uploadSchema = Joi.object({
    annonce_id: Joi.number().integer().positive().optional().messages({
        'number.base': "L'ID de l'annonce doit être un nombre."
    })
});

const updateOrderSchema = Joi.object({
    photoIds: Joi.array()
        .items(Joi.object({
            id: Joi.number().integer().positive().required(),
            ordre: Joi.number().integer().min(0).required()
        }))
        .min(1)
        .required()
        .messages({
            'array.base': "photoIds doit être un tableau.",
            'array.min': "photoIds doit contenir au moins un élément.",
            'any.required': "photoIds est obligatoire."
        })
});

const photoController = {

    upload: async (req, res) => {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "Aucune photo reçue." });
        }

        const { error, value } = uploadSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const userId = req.user.id;
        const annonceId = value.annonce_id || null;

        try {
            const photos = await photoService.uploadPhotos(req.files, userId, annonceId);
            res.status(201).json(photos);
        } catch (error) {
            logger.error("Erreur upload photos:", error);
            res.status(500).json({ error: error.message });
        }
    },

    getByAnnonceId: async (req, res) => {
        const { error, value } = annonceIdSchema.validate({ annonceId: parseInt(req.params.annonceId, 10) });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        try {
            const photos = await photoService.getByAnnonceId(value.annonceId);
            res.json(photos);
        } catch (err) {
            logger.error("Erreur récupération photos par annonce:", err);
            res.status(500).json({ message: "Erreur récupération photos" });
        }
    },

    updateOrder: async (req, res) => {
        const { error: paramError, value: paramValue } = annonceIdSchema.validate({ annonceId: parseInt(req.params.annonceId, 10) });
        if (paramError) {
            return res.status(400).json({ error: paramError.details[0].message });
        }

        const { error: bodyError, value: bodyValue } = updateOrderSchema.validate(req.body);
        if (bodyError) {
            return res.status(400).json({ error: bodyError.details[0].message });
        }

        try {
            const result = await photoService.updateOrder(
                bodyValue.photoIds,
                paramValue.annonceId,
                req.user.id
            );
            res.json(result);
        } catch (error) {
            logger.error("Erreur mise à jour ordre photos:", error);
            const status = error.message.includes("autorisé") ? 403 : 500;
            res.status(status).json({ error: error.message });
        }
    }
};

module.exports = photoController;