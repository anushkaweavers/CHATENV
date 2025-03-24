const catchAsync = require('../utils/catchAsync');
const chatService = require('../services/chat.service');

const createOrGetChat = catchAsync(async (req, res) => {
    console.log('1. Request received');
    const { userId } = req.body;
    
    console.log('2. Validating input');
    if (!userId) {
      return res.status(400).send({ error: 'userId required' });
    }
  
    console.log('3. Calling service');
    const chat = await chatService.createOrGetChat(req.user.id, userId);
    
    console.log('4. Sending response');
    res.send(chat);
  });

const createGroupChat = catchAsync(async (req, res) => {
  const { groupName, userIds } = req.body;
  const chat = await chatService.createGroupChat(groupName, req.user.id, userIds);
  res.send(chat);
});

const getUserChats = catchAsync(async (req, res) => {
  const chats = await chatService.getUserChats(req.user.id);
  res.send(chats)
});

const getChat = catchAsync(async (req, res) => {
  const { chatId } = req.params;
  const chat = await chatService.getChatById(chatId, req.user.id);
  res.send(chat);
});

const addToGroup = catchAsync(async (req, res) => {
  const { chatId } = req.params;
  const { userIds } = req.body;
  const chat = await chatService.addToGroup(chatId, req.user.id, userIds);
  res.send(chat);
});

const removeFromGroup = catchAsync(async (req, res) => {
  const { chatId, userId } = req.params;
  const chat = await chatService.removeFromGroup(chatId, req.user.id, userId);
  res.send(chat);
});

module.exports = {
  createOrGetChat,
  createGroupChat,
  getUserChats,
  getChat,
  addToGroup,
  removeFromGroup,
};