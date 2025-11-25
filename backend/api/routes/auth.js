const express = require('express');
const router = express.Router();

const { postLogin, postSignUp ,postLogout, me } = require('../controllers/authController');
const verifyCookieToken = require('../middlewares/auth')

router.get('/me', verifyCookieToken, me)
router.post('/login', postLogin);
router.post('/signup', postSignUp);
router.post('/logout', postLogout);


module.exports = router;