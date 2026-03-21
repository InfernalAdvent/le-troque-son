const conversationService = require('../services/conversations');

const conversationController = {

    startConversation: async (req, res) => {
        const userId = req.user.id;
        const { annonceId, receveurId } = req.body;

        if (!annonceId || !receveurId) {
            return res.status(400).json({ error: "annonceId et receveurId sont requis." });
        }

        try {
            const conversation = await conversationService.findOrCreateConversation(userId, receveurId, annonceId);
            res.status(200).json(conversation);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    
    getConversations: async (req, res) => {
        const userId = req.user.id;

        try {
            const conversations = await conversationService.getUserConversations(userId);
            res.status(200).json(conversations);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    
    getHistory: async (req, res) => {
        const userId = req.user.id;
        const conversationId = req.params.id;

        try {
            const messages = await conversationService.getConversationHistory(conversationId, userId);
            
            if (messages === null) {
                return res.status(404).json({ error: "Conversation non trouvée." });
            }

            res.status(200).json(messages);
        } catch (error) {
            res.status(403).json({ error: error.message });
        }
    },

    postMessage: async (req, res) => {
        const userId = req.user.id;
        const conversationId = req.params.id;
        const { contenu } = req.body;

        if (!contenu) {
            return res.status(400).json({ error: "Impossible d'envoyer un message sans contenu" });
        }

        try {
            const newMessage = await conversationService.sendMessage(conversationId, userId, contenu);
            res.status(201).json(newMessage);
        } catch (error) {
            res.status(403).json({ error: error.message });
        }
    },
    
    hideConversation: async (req, res) => {
        const userId = req.user.id;
        const conversationId = req.params.id;

        try {
            await conversationService.hideConversation(conversationId, userId);
            res.status(200).json({ message: "Conversation masquée" });
        } catch (error) {
            res.status(403).json({ error: error.message });
        }
    },

    markAsRead: async (req, res) => {
        const userId = req.user.id;
        const conversationId = req.params.id;

        try {
            await conversationService.markAsRead(conversationId, userId);
            res.status(200).json({ message: "Message lu" });
        } catch (error) {
            res.status(500).json({ message: "Erreur serveur" });
        }
    }
};

module.exports = conversationController;
