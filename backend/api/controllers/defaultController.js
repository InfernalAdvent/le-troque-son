
const defaultController = (service) => ({
    
    // Controller pour gérer la requête GET ALL
    getAll: async (req, res) => {
        try {
            const data = await service.getAll();
            res.json(data);
        } catch (error) {
            console.error("Erreur lors de la récupération des données:", error);
            res.status(500).json({ error: "Erreur serveur lors de la récupération des données." });
        }
    },

    // Controller pour gérer la requête GET ONE
    getById: async (req, res) => {
        try {
            const id = req.params.id; // Assume que la route est /:id
            const item = await service.getById(id);
            if (!item) {
                return res.status(404).json({ error: "Ressource non trouvée." });
            }
            res.json(item);
        } catch (error) {
            console.error("Erreur lors de la récupération de l'élément:", error);
            res.status(500).json({ error: "Erreur serveur." });
        }
    }
});

module.exports = defaultController;