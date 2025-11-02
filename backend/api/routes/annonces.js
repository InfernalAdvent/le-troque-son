const express = require('express');
const router = express.Router();

const Annonce = require('../models/annonce');

const verifyCookieToken = require('../middlewares/auth');

const annoncesSpecificController = require('../controllers/annoncesController');

const defaultService = require('../services/defaultService');
const defaultController = require('../controllers/defaultController');

const annoncesDefaultService = defaultService(Annonce);
const annoncesDefaultController = defaultController(annoncesDefaultService);


router.get('/categorie/:id', annoncesSpecificController.getAnnoncesByCategories);
router.get('/:id', annoncesDefaultController.getById);
router.get('/', annoncesDefaultController.getAll);
router.post('/', verifyCookieToken,  annoncesDefaultController.add);
router.put('/:id', verifyCookieToken, annoncesSpecificController.updateAnnonceOwner);
router.delete('/:id', verifyCookieToken, annoncesDefaultController.delete);

module.exports = router;