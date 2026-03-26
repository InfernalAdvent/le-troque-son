const usersService = require('../services/users');
const logger = require('../logger');
const defaultController = require('./defaultController');

const usersController = {
    ...defaultController(usersService),
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