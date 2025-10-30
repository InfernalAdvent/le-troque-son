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

    delete: async(id) => {
        try {
            // Sequelize utilise Model.destroy() et renvoie le nombre de lignes supprimées (1 ou 0)
            const rowsDeleted = await Model.destroy({ 
                where: { id: id } 
            });

            // Si rowsDeleted est 0, l'élément n'a pas été trouvé.
            if (rowsDeleted === 0) {
                return null; // Indique que rien n'a été supprimé
            } 
            
            return true; // Indique que la suppression a réussi

        } catch (error) {
            throw new Error(`Erreur lors de la suppression de l'élément : ${error.message}`);
        };
    }
});

module.exports = defaultService;