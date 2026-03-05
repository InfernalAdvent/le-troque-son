const express = require('express');
const router = express.Router();
const usersService = require('../services/users');
const defaultController = require('../controllers/defaultController');

const usersController = defaultController(usersService);

router.get('/', usersController.getAll);
router.get('/:id', usersController.getById);

module.exports = router;