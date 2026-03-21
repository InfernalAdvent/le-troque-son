const express = require('express');
const router = express.Router();

const { Categorie } = require('../models');
const categoriesSpecificController = require('../controllers/categoriesController');
const defaultService = require('../services/defaultService');
const defaultController = require('../controllers/defaultController');

const categoriesDefaultService = defaultService(Categorie);
const categoriesDefaultController = defaultController(categoriesDefaultService);

router.get('/main', categoriesSpecificController.getMainCategories);
router.get('/:id/children', categoriesSpecificController.getChildCategories);
router.get('/', categoriesDefaultController.getAll);
router.get('/:id', categoriesDefaultController.getById);

module.exports = router;