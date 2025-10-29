const express = require('express');
const router = express.Router();

const Categorie = require('../models/categorie');
const defaultService = require('../services/defaultService');
const defaultController = require('../controllers/defaultController');

const categoriesService = defaultService(Categorie);
const categoriesController = defaultController(categoriesService);

router.get('/', categoriesController.getAll);
router.get('/:id', categoriesController.getById);

module.exports = router;