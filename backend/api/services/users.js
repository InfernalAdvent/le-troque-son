const { User, Departement } = require('../models');
const defaultService = require('./defaultService');
const fs = require('fs');
const path = require('path');

const baseService = defaultService(User);

const usersService = {
    ...baseService,
    
    getById: async (id) => {        
        const user = await User.findByPk(id, {
            attributes: { exclude: ["password"] },
            include: {
                model: Departement,
                attributes: ["id", "nom", "numero"]
            }
        });
        
        return user;
    },

    uploadAvatar: async (userId, file) => {
        const user = await User.findByPk(userId);
        
        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }

        const avatarUrl = `/uploads/${file.filename}`;

        // Supprimer l'ancien avatar si existant
        if (user.avatar_url) {
            const oldPath = path.join(__dirname, '..', user.avatar_url);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Mettre à jour l'avatar
        await user.update({ avatar_url: avatarUrl });

        return { avatar_url: avatarUrl };
    },

    deleteAvatar: async (userId) => {
        const user = await User.findByPk(userId);
        
        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }

        if (user.avatar_url) {
            const filePath = path.join(__dirname, '..', user.avatar_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            await user.update({ avatar_url: null });
        }

        return { message: 'Avatar supprimé' };
    }
};

module.exports = usersService;