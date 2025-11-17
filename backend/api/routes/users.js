const express = require('express');
const router = express.Router();

const User = require('../models/user');
const defaultService = require('../services/defaultService');
const defaultController = require('../controllers/defaultController');

const usersService = defaultService(User);
const usersController = defaultController(usersService);

router.get('/', usersController.getAll);
router.get('/:id', usersController.getById);

module.exports = router;