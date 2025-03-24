const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    chat: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Chat', 
      required: true,
      index: true 
    },
    sender: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    content: { 
      type: String, 
      required: function() { return !this.mediaUrl; },
      trim: true,
      maxlength: 2000
    },
    mediaUrl: { 
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^(http|https):\/\/[^ "]+$/.test(v);
        },
        message: 'Invalid URL format'
      }
    },
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add indexes for better performance
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;