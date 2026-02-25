const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationsController');
const verifyCookieToken = require('../middlewares/auth'); 

router.post('/', verifyCookieToken, conversationController.startConversation);
router.get('/', verifyCookieToken, conversationController.getConversations);
router.get('/:id/messages', verifyCookieToken, conversationController.getHistory);
router.post('/:id/messages', verifyCookieToken, conversationController.postMessage);
router.delete('/:id', verifyCookieToken, conversationController.hideConversation);

module.exports = router;
