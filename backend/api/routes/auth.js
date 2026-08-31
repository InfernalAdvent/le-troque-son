const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { verifyCookieToken } = require("../middlewares/auth");

router.get("/me", verifyCookieToken, authController.me);
router.post("/login", authController.postLogin);
router.post("/signup", authController.postSignUp);
router.post("/logout", authController.postLogout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
