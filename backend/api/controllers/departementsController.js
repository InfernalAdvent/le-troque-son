const departementService = require('../services/departements');

const getAllDepartements = async (req, res) => {
    try {
        const departements = await departementService.getAllDepartements();
        res.json(departements);
    } catch (error) {
        console.error("Erreur lors de la récupérations des départements:", error);
        res.status(500).json({ error: "Erreur serveur"});
    }
};

module.exports = {
    getAllDepartements
};