const { Op } = require('sequelize');
const { Conversation, Message, User, Annonce } = require('../models');

// Configuration pour l'inclusion des relations dans les requêtes
const ConversationIncludes = [
    { model: User, as: 'initiateur', attributes: ['id', 'pseudo'] },
    { model: User, as: 'receveur', attributes: ['id', 'pseudo'] },
    { model: Annonce, as: 'annonce', attributes: ['id', 'titre', 'prix'], paranoid: false } 
];

const MessageIncludes = [
    { model: User, as: 'expediteur', attributes: ['id', 'pseudo'] }
];

const conversationService = {
    /**
     * Tente de trouver une conversation existante entre les deux utilisateurs pour l'annonce donnée.
     * Si elle n'existe pas, la crée.
     * @param {number} userId - L'ID de l'utilisateur initiant/connecté (initiateur).
     * @param {number} receveurId - L'ID de l'utilisateur destinataire.
     * @param {number} annonceId - L'ID de l'annonce concernée.
     * @returns {object} La conversation (existante ou nouvelle).
     */
    findOrCreateConversation: async (userId, receveurId, annonceId) => {
        
        const annonce = await Annonce.findByPk(annonceId);

        if (!annonce || annonce.deleted_at) {
        throw new Error("Cette annonce n'existe plus ou a été supprimée.");
        }

        try {
            // CONVERSION DE TYPE POUR S'ASSURER QUE LA COMPARAISON DE SÉCURITÉ FONCTIONNE
            const initiatorId = parseInt(userId, 10);
            const recipientId = parseInt(receveurId, 10);

            // Empêche un utilisateur de démarrer une conversation avec lui-même
            if (initiatorId === recipientId) {
                throw new Error("Impossible de démarrer une conversation avec soi-même.");
            }

            // 1. Chercher si une conversation existe déjà pour cette annonce entre ces deux utilisateurs
            const existingConversation = await Conversation.findOne({
                where: {
                    annonce_id: annonceId,
                    [Op.or]: [
                        // Cas 1: User est initiateur, Receveur est receveur
                        { utilisateur_initiateur_id: initiatorId, utilisateur_receveur_id: recipientId },
                        // Cas 2: Receveur est initiateur, User est receveur (pour couvrir les deux sens)
                        { utilisateur_initiateur_id: recipientId, utilisateur_receveur_id: initiatorId }
                    ]
                }
            });

            if (existingConversation) {
                return existingConversation;
            }

            // 2. Si non trouvée, créer une nouvelle conversation
            const newConversation = await Conversation.create({
                annonce_id: annonceId,
                utilisateur_initiateur_id: initiatorId, // Utiliser la version numérique
                utilisateur_receveur_id: recipientId,    // Utiliser la version numérique
                date_derniere_activite: new Date()
            });

            return newConversation;

        } catch (error) {
            console.error("Erreur dans findOrCreateConversation:", error);
            throw new Error(`Erreur lors de la création/recherche de la conversation : ${error.message}`);
        }
    },

    /**
     * Récupère la liste des conversations pour un utilisateur donné.
     * @param {number} userId - L'ID de l'utilisateur connecté.
     * @returns {Array<object>} Liste des conversations.
     */
    getUserConversations: async (userId) => {
        try {
            return await Conversation.findAll({
                where: {
                    [Op.or]: [
                        { utilisateur_initiateur_id: userId },
                        { utilisateur_receveur_id: userId }
                    ]
                },
                order: [['date_derniere_activite', 'DESC']],
                include: ConversationIncludes
            });
        } catch (error) {
            console.error("Erreur dans getUserConversations:", error);
            throw new Error(`Erreur lors de la récupération des conversations : ${error.message}`);
        }
    },

    /**
     * Récupère l'historique des messages d'une conversation spécifique.
     * @param {number} conversationId - L'ID de la conversation.
     * @param {number} userId - L'ID de l'utilisateur connecté (pour vérification de l'accès).
     * @returns {Array<object>} Liste des messages.
     */
    getConversationHistory: async (conversationId, userId) => {
        try {

            const currentUserId = parseInt(userId, 10);
            // 1. Vérifier si l'utilisateur fait partie de la conversation
            const conversation = await Conversation.findByPk(conversationId);
            
            if (!conversation) {
                return null; // Conversation non trouvée
            }
            
            const isParticipant = (
                conversation.utilisateur_initiateur_id === currentUserId ||
                conversation.utilisateur_receveur_id === currentUserId
            );

            if (!isParticipant) {
                throw new Error("Accès refusé. L'utilisateur n'est pas participant à cette conversation.");
            }
            // 2. Marquer les messages comme lus par le destinataire (l'utilisateur actuel)
            // L'utilisateur actuel est le destinataire si l'expéditeur n'est pas lui.
            await Message.update(
                { lu_par_destinataire: true },
                {
                    where: {
                        conversation_id: conversationId,
                        expediteur_id: { [Op.ne]: currentUserId }, // Les messages envoyés par l'autre partie
                        lu_par_destinataire: false // Uniquement les messages non lus
                    }
                }
            );

            // 3. Récupérer les messages après la mise à jour
            const messages = await Message.findAll({
                where: { conversation_id: conversationId },
                order: [['date_envoi', 'ASC']],
                include: MessageIncludes 
            });
            return messages;

        } catch (error) {
            console.error("Erreur dans getConversationHistory:", error);
            throw new Error(`Erreur lors de la récupération de l'historique : ${error.message}`);
        }
    },

    /**
     * Ajoute un nouveau message à une conversation existante.
     * @param {number} conversationId - L'ID de la conversation.
     * @param {number} userId - L'ID de l'expéditeur.
     * @param {string} contenu - Le contenu du message.
     * @returns {object} Le nouveau message créé.
     */
    sendMessage: async (conversationId, userId, contenu) => {
        try {
            const senderId = parseInt(userId, 10);
            // 1. Vérifier si l'utilisateur fait partie de la conversation
            const conversation = await Conversation.findByPk(conversationId);

            if (!conversation) {
                throw new Error("Conversation non trouvée.");
            }
            
            const isParticipant = (
                conversation.utilisateur_initiateur_id === senderId ||
                conversation.utilisateur_receveur_id === senderId
            );

            if (!isParticipant) {
                throw new Error("Accès refusé. Vous n'êtes pas autorisé à envoyer un message dans cette conversation.");
            }

            // 2. Créer le message
            const newMessage = await Message.create({
                conversation_id: conversationId,
                expediteur_id: senderId,
                contenu: contenu,
                // lu_par_destinataire sera false par défaut, c'est l'autre partie qui le marquera comme lu.
            });

            // 3. Mettre à jour la date de dernière activité de la conversation
            await conversation.update({ date_derniere_activite: new Date() });

            return newMessage;

        } catch (error) {
            console.error("Erreur lors de l'envoi du message :", error);
            throw new Error(`Erreur lors de l'envoi du message : ${error.message}`);
        }
    }
};

module.exports = conversationService;
