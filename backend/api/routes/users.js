const express = require('express');
const router = express.Router();
const usersService = require('../services/users');
const defaultController = require('../controllers/defaultController');
const usersController = require('../controllers/usersController'); 
const verifyCookieToken = require('../middlewares/auth');
const { avatar: uploadAvatar } = require('../middlewares/upload');


router.get('/:pseudo', usersController.getByPseudo);

router.post('/avatar', verifyCookieToken, uploadAvatar.single('avatar'), usersController.uploadAvatar);
router.delete('/avatar', verifyCookieToken, usersController.deleteAvatar);

module.exports = router;