const defaultService = (Model) => ({
    
    getAll: async (options = {}) => {
        return await Model.findAll(options);
    },

    getById: async (id) => {
        return await Model.findByPk(id);
    },

    getByUserId: async(userId) => {
        if(!userId) {
            return null
        }
        return await Model.findAll({
            where: {
                user_id: userId
            }
        });
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
            const whereOwner = {id: id}
            if(userId) {
                whereOwner.user_id = userId
            }
            const rowsDeleted = await Model.destroy({ 
                where: whereOwner
            });

            if (rowsDeleted === 0) {
                return null; 
            } 
            
            return true; 

        } catch (error) {
            throw new Error(`Erreur lors de la suppression de l'élément : ${error.message}`);
        };
    }
});

module.exports = defaultService;