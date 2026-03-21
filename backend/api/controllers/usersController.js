const usersService = require('../services/users');

const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier fourni' });
        }

        const result = await usersService.uploadAvatar(req.user.id, req.file);
        res.json(result);
    } catch (err) {
        console.error('Erreur upload avatar:', err);
        res.status(500).json({ error: err.message || 'Erreur serveur' });
    }
};

const deleteAvatar = async (req, res) => {
    try {
        const result = await usersService.deleteAvatar(req.user.id);
        res.json(result);
    } catch (err) {
        console.error('Erreur suppression avatar:', err);
        res.status(500).json({ error: err.message || 'Erreur serveur' });
    }
};

module.exports = { uploadAvatar, deleteAvatar };