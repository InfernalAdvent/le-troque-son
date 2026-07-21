const { User, Departement } = require('../models');
const defaultService = require('./defaultService');
const { uploadToCloudinary } = require('../middlewares/upload');
const cloudinary = require('cloudinary').v2;
const { Op } = require('sequelize');

const baseService = defaultService(User);

const usersService = {
    ...baseService,
    
    getByPseudo: async (identifier) => {     
        
        const isNumeric = !isNaN(identifier) && Number.isInteger(Number(identifier));

        const user = await User.findOne({
            where: {
                [Op.or]: [
                    ...(isNumeric ? [{ id: identifier }] : []), // Si c'est un nombre, check l'ID
                    { pseudo: identifier } // Dans tous les cas, check le pseudo
                ]
            },
            attributes: { exclude: ["email", "password"] },
            include: {
                model: Departement,
                attributes: ["id", "nom", "numero"]
            }
        });
        
        return user;
    },

    uploadAvatar: async (userId, file) => {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("Utilisateur non trouvé");

        // Supprimer l'ancien avatar sur Cloudinary si existant
        if (user.avatar_public_id) {
            await cloudinary.uploader.destroy(user.avatar_public_id);
        }

        const result = await uploadToCloudinary(file.buffer, 'avatars');

        await user.update({ 
            avatar_url: result.secure_url,
            avatar_public_id: result.public_id
        });

        return { avatar_url: result.secure_url };
    },

    // Remplace deleteAvatar :
    deleteAvatar: async (userId) => {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("Utilisateur non trouvé");

        if (user.avatar_public_id) {
            await cloudinary.uploader.destroy(user.avatar_public_id);
            await user.update({ avatar_url: null, avatar_public_id: null });
        }

        return { message: 'Avatar supprimé' };
    }
};

module.exports = usersService;