const express = require('express');
const router = express.Router();

const verifyCookieToken = require('../middlewares/auth');

const annoncesSpecificController = require('../controllers/annoncesController');

router.get('/search', annoncesSpecificController.searchAnnonces);
router.get('/user/:userId', annoncesSpecificController.getByUserId);
router.get('/categorie/:id', annoncesSpecificController.getAnnoncesByCategories);
router.get('/', annoncesSpecificController.getAllWithFilters);
router.get('/:id', annoncesSpecificController.getAnnonceWithUser);
router.post('/', verifyCookieToken,  annoncesSpecificController.createAnnonce);
router.put('/:id', verifyCookieToken, annoncesSpecificController.updateAnnonceOwner);
router.delete('/:id', verifyCookieToken, annoncesSpecificController.deleteAnnonce);

module.exports = router;