const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  // Check if chat already exists
  const existingChat = await Chat.findOne({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  if (existingChat) {
    // Populate sender info if there's a latest message
    if (existingChat.latestMessage) {
      await User.populate(existingChat, {
        path: "latestMessage.sender",
        select: "name pic email",
      });
    }
    return res.send(existingChat);
  }

  // Create new chat if none exists
  try {
    const otherUser = await User.findById(userId).select("name");
    const chatName = otherUser ? otherUser.name : "Personal Chat";

    const chatData = {
      chatName,
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    const createdChat = await Chat.create(chatData);
    const fullChat = await Chat.findOne({ _id: createdChat._id })
      .populate("users", "-password")
      .populate("latestMessage");

    res.status(200).json(fullChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = asyncHandler(async (req, res) => {
  try {
    const results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    // Populate sender info for latest messages
    await User.populate(results, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.status(200).send(results);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  const users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  // Add current user to the group
  users.push(req.user._id);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name.trim(),
      users,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  if (!chatName || !chatId) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  // Check if user is part of the group
  const chat = await Chat.findOne({
    _id: chatId,
    users: { $elemMatch: { $eq: req.user._id } }
  });

  if (!chat) {
    return res.status(403).send({ message: "Not authorized to rename this group" });
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName: chatName.trim() },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    return res.status(404).send({ message: "Chat Not Found" });
  }

  res.json(updatedChat);
});

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  const chat = await Chat.findOne({ _id: chatId });
  if (!chat) {
    return res.status(404).send({ message: "Chat Not Found" });
  }

  // Check permissions
  const isAdmin = chat.groupAdmin.toString() === req.user._id.toString();
  const isSelf = userId === req.user._id.toString();

  if (!isAdmin && !isSelf) {
    return res.status(403).send({ message: "Only admins can remove other members" });
  }

  // Prevent admin from leaving without transferring admin rights
  if (isAdmin && isSelf && chat.users.length > 1) {
    return res.status(400).send({ 
      message: "Please transfer admin rights before leaving the group" 
    });
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.json(updatedChat);
});

// @desc    Add user to Group
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  const chat = await Chat.findOne({ _id: chatId });
  if (!chat) {
    return res.status(404).send({ message: "Chat Not Found" });
  }

  // Check if requester is admin
  if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    return res.status(403).send({ message: "Only admins can add members" });
  }

  // Check if user is already in group
  if (chat.users.some(u => u.toString() === userId)) {
    return res.status(400).send({ message: "User already in group" });
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { $addToSet: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.json(updatedChat);
});

// @desc    Transfer admin rights
// @route   PUT /api/chat/groupadmin
// @access  Protected
const transferGroupAdmin = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  const chat = await Chat.findOne({ _id: chatId });
  if (!chat) {
    return res.status(404).send({ message: "Chat Not Found" });
  }

  // Verify current admin is making the request
  if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    return res.status(403).send({ message: "Only current admin can transfer rights" });
  }

  // Verify new admin is a group member
  if (!chat.users.some(u => u.toString() === userId)) {
    return res.status(400).send({ message: "User must be a group member" });
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { groupAdmin: userId },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.json(updatedChat);
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  transferGroupAdmin,
};