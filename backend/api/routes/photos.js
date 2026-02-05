const express = require('express');
const router = express.Router();

const verifyCookieToken = require('../middlewares/auth');
const upload = require("../middlewares/upload");

const { Photo } = require('../models');

const defaultService = require('../services/defaultService');
const defaultController = require('../controllers/defaultController');

const photosDefaultService = defaultService(Photo);
const photosDefaultController = defaultController(photosDefaultService);
const photosSpecificController = require("../controllers/photosController");

router.get('/', photosDefaultController.getAll);
router.delete('/:id', verifyCookieToken, photosDefaultController.delete);
router.post(
    "/upload",
    verifyCookieToken,
    upload.array("photos", 10),
    photosSpecificController.upload
);
router.get('/annonce/:annonceId', photosSpecificController.getByAnnonceId);

module.exports = router;
