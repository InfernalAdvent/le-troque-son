const conversationService = require('../services/conversations');
const logger = require('../logger');
const Joi = require('joi');

const conversationIdSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': "L'ID doit être un nombre.",
        'any.required': "L'ID de la conversation est obligatoire."
    })
});

const startConversationSchema = Joi.object({
    annonceId: Joi.number().integer().positive().required().messages({
        'number.base': "L'ID de l'annonce doit être un nombre.",
        'any.required': "L'ID de l'annonce est obligatoire."
    }),
    receveurId: Joi.number().integer().positive().required().messages({
        'number.base': "L'ID du receveur doit être un nombre.",
        'any.required': "L'ID du receveur est obligatoire."
    })
});

const postMessageSchema = Joi.object({
    contenu: Joi.string().min(1).max(2000).required().messages({
        'string.min': "Le message ne peut pas être vide.",
        'string.max': "Le message ne doit pas dépasser 2000 caractères.",
        'any.required': "Le contenu du message est obligatoire."
    })
});

const conversationController = {

    startConversation: async (req, res) => {
        const { error, value } = startConversationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const userId = req.user.id;
        const { annonceId, receveurId } = value;

        try {
            const conversation = await conversationService.findOrCreateConversation(userId, receveurId, annonceId);
            res.status(200).json(conversation);
        } catch (error) {
            logger.error("Erreur lors du démarrage de la conversation:", error);
            res.status(400).json({ error: error.message });
        }
    },

    getConversations: async (req, res) => {
        // Pas de params ni body à valider, userId vient du token
        const userId = req.user.id;

        try {
            const conversations = await conversationService.getUserConversations(userId);
            res.status(200).json(conversations);
        } catch (error) {
            logger.error("Erreur lors de la récupération des conversations:", error);
            res.status(500).json({ error: error.message });
        }
    },

    getHistory: async (req, res) => {
        const { error, value } = conversationIdSchema.validate({ id: parseInt(req.params.id, 10) });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const userId = req.user.id;
        const conversationId = value.id;

        try {
            const messages = await conversationService.getConversationHistory(conversationId, userId);

            if (messages === null) {
                return res.status(404).json({ error: "Conversation non trouvée." });
            }

            res.status(200).json(messages);
        } catch (error) {
            logger.error("Erreur lors de la récupération de l'historique:", error);
            res.status(403).json({ error: error.message });
        }
    },

    postMessage: async (req, res) => {
        const { error: paramError, value: paramValue } = conversationIdSchema.validate({ id: parseInt(req.params.id, 10) });
        if (paramError) {
            return res.status(400).json({ error: paramError.details[0].message });
        }

        const { error: bodyError, value: bodyValue } = postMessageSchema.validate(req.body);
        if (bodyError) {
            return res.status(400).json({ error: bodyError.details[0].message });
        }

        const userId = req.user.id;
        const conversationId = paramValue.id;
        const { contenu } = bodyValue;

        try {
            const newMessage = await conversationService.sendMessage(conversationId, userId, contenu);
            res.status(201).json(newMessage);
        } catch (error) {
            logger.error("Erreur lors de l'envoi du message:", error);
            res.status(403).json({ error: error.message });
        }
    },

    hideConversation: async (req, res) => {
        const { error, value } = conversationIdSchema.validate({ id: parseInt(req.params.id, 10) });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const userId = req.user.id;
        const conversationId = value.id;

        try {
            await conversationService.hideConversation(conversationId, userId);
            res.status(200).json({ message: "Conversation masquée" });
        } catch (error) {
            logger.error("Erreur lors du masquage de la conversation:", error);
            res.status(403).json({ error: error.message });
        }
    },

    markAsRead: async (req, res) => {
        const { error, value } = conversationIdSchema.validate({ id: parseInt(req.params.id, 10) });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const userId = req.user.id;
        const conversationId = value.id;

        try {
            await conversationService.markAsRead(conversationId, userId);
            res.status(200).json({ message: "Message lu" });
        } catch (error) {
            logger.error("Erreur markAsRead:", error);
            res.status(500).json({ message: "Erreur serveur" });
        }
    }
};

module.exports = conversationController;