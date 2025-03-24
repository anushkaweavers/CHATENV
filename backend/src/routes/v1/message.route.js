const express = require('express');
const auth = require('../../middlewares/auth');
const messageController = require('../../controllers/message.controller');

const router = express.Router();

router.post('/', auth, messageController.sendMessage);
router.get('/:chatId', auth, messageController.getChatMessages);

module.exports = router;
