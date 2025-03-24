const Chat = require('../models/chat.model');
const Message = require('../models/message.model');
const { NotFoundError, BadRequestError } = require('../errors');

/**
 * Create or get a one-on-one chat with proper validation
 */
const createOrGetChat = async (userId1, userId2) => {
    let chat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [userId1, userId2] }
    }).maxTimeMS(5000); // 5-second timeout
  
    if (!chat) {
      chat = await Chat.create({ 
        participants: [userId1, userId2] 
      }).maxTimeMS(5000);
    }
    return chat;
  };

/**
 * Create a group chat with validation
 */
const createGroupChat = async (groupName, adminId, userIds) => {
  const uniqueParticipants = [...new Set([...userIds, adminId])];
  
  if (uniqueParticipants.length < 2) {
    throw new BadRequestError('Group must have at least 2 members');
  }

  const chat = await Chat.create({
    isGroup: true,
    groupName,
    groupAdmin: adminId,
    participants: uniqueParticipants
  });

  return chat.populate({
    path: 'participants groupAdmin',
    select: 'username profilePicture status'
  });
};

/**
 * Get all chats for a user with last message and unread counts
 */
const getUserChats = async (userId) => {
  return Chat.find({ participants: userId })
    .populate({
      path: 'participants',
      match: { _id: { $ne: userId } },
      select: 'username profilePicture status'
    })
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'username profilePicture'
      }
    })
    .populate({
      path: 'groupAdmin',
      select: 'username profilePicture'
    })
    .sort({ updatedAt: -1 });
};

/**
 * Mark messages as read in a chat
 */
const markMessagesAsRead = async (chatId, userId) => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new NotFoundError('Chat not found');
  }

  if (!chat.participants.includes(userId)) {
    throw new BadRequestError('User not in this chat');
  }

  // Update unread count
  chat.unreadCount.set(userId.toString(), 0);
  await chat.save();

  // Mark messages as read
  await Message.updateMany(
    { 
      chat: chatId,
      sender: { $ne: userId },
      readBy: { $ne: userId }
    },
    { $addToSet: { readBy: userId } }
  );
};

module.exports = {
  createOrGetChat,
  createGroupChat,
  getUserChats,
  markMessagesAsRead
};