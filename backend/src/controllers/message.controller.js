const catchAsync = require('../utils/catchAsync');
const messageService = require('../services/message.service');

const sendMessage = catchAsync(async (req, res) => {
  const { chatId, content, mediaUrl } = req.body;
  const message = await messageService.sendMessage(chatId, req.user.id, content, mediaUrl);
  res.send(message);
});

const getChatMessages = catchAsync(async (req, res) => {
  const { chatId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const messages = await messageService.getChatMessages(chatId, req.user.id, page, limit);
  res.send(messages);
});

const markMessagesAsRead = catchAsync(async (req, res) => {
  const { chatId } = req.params;
  await messageService.markAsRead(chatId, req.user.id);
  res.send({ status: 'success' });
});

module.exports = {
  sendMessage,
  getChatMessages,
  markMessagesAsRead,
};