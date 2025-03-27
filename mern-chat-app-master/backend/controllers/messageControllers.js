const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;
  const files = req.files; // Media files

  if (!content && (!files || files.length === 0)) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  let mediaFiles = [];
  
  // Upload files to Cloudinary
  if (files && files.length > 0) {
    mediaFiles = await Promise.all(
      files.map(async (file) => {
        const result = await uploadToCloudinary(file.buffer, file.mimetype);
        return { url: result.secure_url, type: file.mimetype.split("/")[0] };
      })
    );
  }

  const newMessage = new Message({
    sender: req.user._id,
    content: content || "", // Emojis supported automatically
    chat: chatId,
    media: mediaFiles, // Attach uploaded media
  });

  try {
    let message = await newMessage.save();

    message = await message.populate("sender", "name pic").execPopulate();
    message = await message.populate("chat").execPopulate();
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage };