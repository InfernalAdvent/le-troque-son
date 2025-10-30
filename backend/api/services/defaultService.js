const { Op } = require('sequelize');

const defaultService = (Model) => ({
    
    getAll: async (options = {}) => {
        return await Model.findAll(options);
    },

    getById: async (id) => {
        return await Model.findByPk(id);
    },

    add: async (data) => {
       try {
            const newElement = new Model(data);
            const savedElement = await newElement.save();
            return savedElement;
       } catch (error) {
            throw new Error(`Erreur lors de la création : ${error.message}`);
        };
    },

    update: async(id, data) => { 
        try {
            const [rowsAffected] = await Model.update(data, {
                where: { id: id }
            });
            if (rowsAffected === 0) {
                return null; 
            }
            const updatedElement = await Model.findByPk(id);
            return updatedElement;
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour de l'élément: ${error.message}`);
        }
    },

    delete: async(id, userId) => {
        try {
           
            if (userId) {

                const rowsDeleted = await Model.destroy({ 
                    where: {
                        id: id,
                        [Op.or]: [
                            { user_id: userId },
                            { utilisateur_id: userId }
                        ]
                    }
                });


                if (rowsDeleted === 0) {
                    return null; 
                } 

            return true; 

            } else {
                return null;
            }

        } catch (error) {
        throw new Error(`Erreur lors de la suppression de l'élément : ${error.message}`);
        };
    }
});

module.exports = defaultService;