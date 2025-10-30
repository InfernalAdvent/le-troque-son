const express = require('express');
const router = express.Router();

const Wishlist = require('../models/wishlist');
const verifyCookieToken = require('../middlewares/auth');

const wishlistSpecificController = require('../controllers/wishlistsController');

const defaultService = require('../services/defaultService');
const defaultController = require('../controllers/defaultController');

const wishlistDefaultService = defaultService(Wishlist);
const wishlistDefaultController = defaultController(wishlistDefaultService);

router.get('/', wishlistDefaultController.getAll);
router.get('/:id', wishlistDefaultController.getById);
router.post('/', verifyCookieToken, wishlistDefaultController.add);
router.put('/:id', verifyCookieToken, wishlistSpecificController.updateWishlistOwner);
router.delete('/:id', verifyCookieToken, wishlistSpecificController.deleteWishlistOwner);

module.exports = router;