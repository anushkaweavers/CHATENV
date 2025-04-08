const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, trim: true }, // Emojis are supported as normal strings
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    media: [
      {
        url: { type: String, trim: true }, // Cloudinary or any storage link
        type: { type: String, enum: ["image", "video", "file"], required: true },
      },
    ],
  },
  {timestamp:true}
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
