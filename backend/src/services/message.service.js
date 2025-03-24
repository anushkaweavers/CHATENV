const Message = require('../models/message.model');
const Chat = require('../models/chat.model');
const { NotFoundError } = require('../errors');

/**
 * Send a message with validation and unread count tracking
 */
const sendMessage = async (chatId, senderId, content, mediaUrl = null) => {
  if (!content && !mediaUrl) {
    throw new BadRequestError('Message content or media is required');
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new NotFoundError('Chat not found');
  }

  if (!chat.participants.includes(senderId)) {
    throw new BadRequestError('You are not a participant in this chat');
  }

  // Create message
  const message = await Message.create({
    chat: chatId,
    sender: senderId,
    content,
    mediaUrl
  });

  // Populate sender info
  await message.populate({
    path: 'sender',
    select: 'username profilePicture'
  });

  // Update chat's last message and increment unread counts
  chat.lastMessage = message._id;
  
  // Increment unread count for all participants except sender
  chat.participants.forEach(participantId => {
    if (participantId.toString() !== senderId.toString()) {
      const currentCount = chat.unreadCount.get(participantId.toString()) || 0;
      chat.unreadCount.set(participantId.toString(), currentCount + 1);
    }
  });

  await chat.save();

  return message;
};

/**
 * Get messages from a chat with pagination
 */
const getChatMessages = async (chatId, userId, page = 1, limit = 20) => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new NotFoundError('Chat not found');
  }

  if (!chat.participants.includes(userId)) {
    throw new BadRequestError('You are not a participant in this chat');
  }

  // Mark messages as read when fetching
  await Message.updateMany(
    { 
      chat: chatId,
      sender: { $ne: userId },
      readBy: { $ne: userId }
    },
    { $addToSet: { readBy: userId } }
  );

  // Reset unread count
  chat.unreadCount.set(userId.toString(), 0);
  await chat.save();

  return Message.find({ chat: chatId })
    .populate({
      path: 'sender',
      select: 'username profilePicture'
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

module.exports = {
  sendMessage,
  getChatMessages
};