const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    isGroup: { type: Boolean, default: false },
    participants: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true,
      validate: {
        validator: function(participants) {
          return !this.isGroup || participants.length >= 2;
        },
        message: 'Group chat must have at least 2 participants'
      }
    }],
    groupName: { 
      type: String, 
      required: function() { return this.isGroup; },
      trim: true
    },
    groupAdmin: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: function() { return this.isGroup; }
    },
    lastMessage: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Message' 
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add index for better performance
chatSchema.index({ participants: 1, isGroup: 1 });
chatSchema.index({ updatedAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;