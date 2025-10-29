const annoncesService = require('../services/annonces');

const getAnnoncesByCategories = async (req, res) => {
    const categorieId = req.params.id;

    try{
        const annonces = await annoncesService.getAnnoncesByCategories(categorieId);
        res.json(annonces);
    } catch (error) {
        console.error("Erreur lors de la récupérations des annonces:", error);
        res.status(500).json({error: "Erreur serveur"});
    }
};

module.exports = {
    getAnnoncesByCategories
};