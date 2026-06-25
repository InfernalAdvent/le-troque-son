const conversationService = require('../services/conversations');
const logger = require('../logger');
const Joi = require('joi');
const { getIo } = require('../socket');

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
            const conversations = await conversationService.getConversations(userId);
            res.status(200).json(conversations);
        } catch (error) {
            logger.error("Erreur lors de la récupération des conversations:", error);
            res.status(500).json({ error: "Erreur serveur." });
        }
    },

    getConversationHistory: async (req, res) => {
        const { error, value } = conversationIdSchema.validate({ id: parseInt(req.params.id, 10) });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const userId = req.user.id;
        const conversationId = value.id;

        try {
            const result = await conversationService.getConversationHistory(conversationId, userId);

            if (result === null) {
                return res.status(404).json({ error: "Conversation non trouvée." });
            }

            const { messages, markedAsRead } = result;

            // Prévenir le ou les expéditeurs que leurs messages ont été lus
            if (markedAsRead.length > 0) {
                const io = getIo();
                const senderIds = [...new Set(markedAsRead.map(m => m.expediteur_id))];
                senderIds.forEach(senderId => {
                    io.to(`user_${senderId}`).emit('messages_lus', { conversationId });
                });
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
            const { newMessage, recipientId } = await conversationService.sendMessage(conversationId, userId, contenu);
            const io = getIo();
            const payload = { conversationId, message: newMessage };

            // Émettre au destinataire
            io.to(`user_${recipientId}`).emit('nouveau_message', payload);
            io.to(`user_${recipientId}`).emit('nouvelle_notification');

            // Émettre aussi à l'expéditeur pour mettre à jour son UI
            io.to(`user_${userId}`).emit('nouveau_message', payload);

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
    }
};

module.exports = conversationController;