const express = require('express');
const router = express.Router();

const verifyCookieToken = require('../middlewares/auth');

const Photo = require('../models/photo');
const defaultService = require('../services/defaultService');
const defaultController = require('../controllers/defaultController');

const photosDefaultService = defaultService(Photo);
const photosDefaultController = defaultController(photosDefaultService);

router.get('/', photosDefaultController.getAll);
router.post('/', verifyCookieToken, photosDefaultController.add); 
router.delete('/:id', verifyCookieToken, photosDefaultController.delete);

module.exports = router;
