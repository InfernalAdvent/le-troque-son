const defaultService = (Model) => ({
    
    getAll: async (options = {}) => {
        return await Model.findAll(options);
    },

    getById: async (id) => {
        return await Model.findByPk(id);
    },
});

module.exports = defaultService;