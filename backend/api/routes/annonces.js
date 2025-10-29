const express = require('express');
const router = express.Router();

const Annonce = require('../models/annonce');
const Controller = require('../controllers/annoncesController');
const defaultService = require('../services/defaultService');
const defaultController = require('../controllers/defaultController');
const Login = require('../controllers/authController');

const annoncesService = defaultService(Annonce);
const annoncesController = defaultController(annoncesService);


router.get('/categorie/:id', Controller.getAnnoncesByCategories);
router.get('/:id', annoncesController.getById);
router.get('/', annoncesController.getAll);

module.exports = router;