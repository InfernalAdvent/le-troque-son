const express = require('express');
const router = express.Router();

const Wishlist = require('../models/wishlist');
const defaultService = require('../services/defaultService');
const defaultController = require('../controllers/defaultController');

const wishlistService = defaultService(Wishlist);
const wishlistController = defaultController(wishlistService);

router.get('/', wishlistController.getAll);
router.get('/:id', wishlistController.getById);

module.exports = router;