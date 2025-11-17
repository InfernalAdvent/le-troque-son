const express = require('express');
const router = express.Router();

const Departement = require('../models/departement');
const defaultService = require('../services/defaultService');
const defaultController = require('../controllers/defaultController');

const departementsService = defaultService(Departement);
const departementsController = defaultController(departementsService);

router.get('/', departementsController.getAll);
router.get('/:id', departementsController.getById);

module.exports = router;