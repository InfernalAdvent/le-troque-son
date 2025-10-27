const express = require('express');
const router = express.Router();
const { getAllDepartements } = require('../controllers/departementsController');

router.get('/', getAllDepartements);

module.exports = router;