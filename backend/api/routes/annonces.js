const express = require("express");
const router = express.Router();

const { verifyCookieToken } = require("../middlewares/auth");

const annoncesController = require("../controllers/annoncesController");

router.get("/search", annoncesController.searchAnnonces);
router.get("/user/:userId", annoncesController.getByUserId);
router.get("/categorie/:id", annoncesController.getAnnoncesByCategories);
router.get("/", annoncesController.getAllWithFilters);
router.get("/:id", annoncesController.getAnnonceWithUser);
router.post("/", verifyCookieToken, annoncesController.createAnnonce);
router.put("/:id", verifyCookieToken, annoncesController.updateAnnonceOwner);
router.delete("/:id", verifyCookieToken, annoncesController.deleteAnnonce);

module.exports = router;
