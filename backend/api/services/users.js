const { User, Departement } = require('../models');
const defaultService = require('./defaultService');

const baseService = defaultService(User);

const usersService = {
    ...baseService,
    
    getById: async (id) => {
        console.log("🔍 usersService.getById appelé avec id:", id); // 👈 Debug
        
        const user = await User.findByPk(id, {
            attributes: { exclude: ["password"] },
            include: {
                model: Departement,
                attributes: ["id", "nom", "numero"]
            }
        });
        
        console.log("User trouvé:", user?.toJSON()); // 👈 Debug
        
        return user;
    }
};

module.exports = usersService;