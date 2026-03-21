const express = require('express');
const router = express.Router();
const usersService = require('../services/users');
const defaultController = require('../controllers/defaultController');
const usersController = require('../controllers/usersController'); 
const verifyCookieToken = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const controller = defaultController(usersService);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);

router.post('/avatar', verifyCookieToken, upload.single('avatar'), usersController.uploadAvatar);
router.delete('/avatar', verifyCookieToken, usersController.deleteAvatar);

module.exports = router;