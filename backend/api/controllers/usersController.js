const usersService = require('../services/users');
const logger = require('../logger');
const defaultController = require('./defaultController');

const usersController = {
    ...defaultController(usersService),

    getByPseudo: async (req, res) => {
        const { identifier } = req.params;

        if (!identifier) {
            return res.status(400).json({ error: "Le pseudo est obligatoire." });
        }

        try {
            const user = await usersService.getByPseudo(identifier);
            if (!user) {
                return res.status(404).json({ error: "Utilisateur non trouvé." });
            }
            res.json(user);
        } catch (err) {
            logger.error("Erreur récupération utilisateur par identifiant:", err);
            res.status(500).json({ error: "Erreur serveur." });
        }
    },
    
    uploadAvatar: async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier fourni' });
        }

        try {
            const result = await usersService.uploadAvatar(req.user.id, req.file);
            res.json(result);
        } catch (err) {
            logger.error('Erreur upload avatar:', err);
            res.status(500).json({ error: err.message || 'Erreur serveur' });
        }
    },

    deleteAvatar: async (req, res) => {
        try {
            const result = await usersService.deleteAvatar(req.user.id);
            res.json(result);
        } catch (err) {
            logger.error('Erreur suppression avatar:', err);
            res.status(500).json({ error: err.message || 'Erreur serveur' });
        }
    }
};

module.exports = usersController;