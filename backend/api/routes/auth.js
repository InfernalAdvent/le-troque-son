const express = require('express');
const router = express.Router();

const { postLogin, postSignUp ,postLogout } = require('../controllers/authController');

router.post('/login', postLogin);
router.post('/signup', postSignUp);
router.post('/logout', postLogout);


module.exports = router;