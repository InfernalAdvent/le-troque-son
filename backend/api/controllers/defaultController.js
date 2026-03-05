const defaultService = require("../services/defaultService");
const usersService = require("../services/users");

const defaultController = (service) => ({
    
    getAll: async (req, res) => {
        try {
            const data = await service.getAll();
            res.json(data);
        } catch (error) {
            console.error("Erreur lors de la récupération des données:", error);
            res.status(500).json({ error: "Erreur serveur lors de la récupération des données." });
        }
    },

    getById: async (req, res) => {
        try {
            const id = req.params.id;
            const item = await service.getById(id);
            if (!item) {
                return res.status(404).json({ error: "Ressource non trouvée." });
            }
            res.json(item);
        } catch (error) {
            console.error("Erreur lors de la récupération de l'élément:", error);
            res.status(500).json({ error: "Erreur serveur." });
        }
    },

    getByUserId: async (req, res) => {
        try {
            const userId = req.params.userId;
            if(!userId) {
                return res.status(400).json({ error: "Le paramètre userId est requis"});
            }
            const entries = await service.getByUserId(userId);
            if(!entries || entries.length === 0) {
                return res.status(404).json({ error: "Ressources non trouvées."});
            }
            res.json(entries);
        } catch (error) {
            res.status(500).json({ error: "Erreur serveur." });
        }
    },

    add: async (req, res) => {
        if (req.user && req.user.id) {
            req.body.user_id = req.user.id;
        } else {
                return res.status(401).json({ error: "Utilisateur non identifié après l'authentification." });
            }
        try {
            const newElement = await service.add(req.body);
            res.status(201).json(newElement);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    update: async(req, res) => {
        try {
            const updatedElement = await service.update(req.params.id, req.body); 
            
            if (!updatedElement) {
                return res.status(404).json({ message: 'Élément non trouvé'});
            }
            res.status(200).json(updatedElement);
        } catch (error) {
            res.status(500).json({ error: error.message}); 
        }
    },

    delete: async(req, res) => {
        try {
            const id = req.params.id;
            const userId = req.user ? req.user.id : null;
            if(!userId) {
                return res.status(401).json({ error: "Authentification requise pour supprimer cet élément."});
            }
            const deletedElement = await service.delete(id, userId);
            if (!deletedElement) {
                return res.status(404).json({ message: 'Élément non trouvé ou vous ne disposez les droits pour supprimer cet élément'});
            }
            res.status(204).send();
        } catch (error) {
            console.error("Erreur lors de la suppression de l'élément:", error);
            res.status(500).json({ error: error.message });
        };
    }
});

module.exports = defaultController;