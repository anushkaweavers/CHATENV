const express = require('express');
const auth = require('../../middlewares/auth');
const chatController = require('../../controllers/chat.controller');

const router = express.Router();
router.get('/test', (req, res) => {
    res.send({ status: 'working', timestamp: new Date() });
  });
router.post('/simple', auth(), async (req, res) => {
    try {
      const chat = await Chat.create({
        participants: [req.user.id, req.body.userId]
      });
      res.send(chat);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
router.post('/create', auth, chatController.createOrGetChat);
router.post('/group', auth, chatController.createGroupChat);
router.get('/', auth, chatController.getUserChats);

module.exports = router;
