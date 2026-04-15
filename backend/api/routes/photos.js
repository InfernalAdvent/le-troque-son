const express = require('express');
const router = express.Router();

const verifyCookieToken = require('../middlewares/auth');
const { photos: upload } = require("../middlewares/upload");

const { Photo } = require('../models');

const defaultService = require('../services/defaultService');
const defaultController = require('../controllers/defaultController');

const photosDefaultService = defaultService(Photo);
const photosDefaultController = defaultController(photosDefaultService);
const photosSpecificController = require("../controllers/photosController");

router.get('/', photosSpecificController.getAllPublic);
router.delete('/:id', verifyCookieToken, photosDefaultController.delete);
router.post(
    "/upload",
    verifyCookieToken,
    upload.array("photos", 10),
    photosSpecificController.upload
);
router.get('/annonce/:annonceId', photosSpecificController.getByAnnonceId);
router.put('/ordre/:annonceId', verifyCookieToken, photosSpecificController.updateOrder);

module.exports = router;
