const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reportType: {
      type: String,
      enum: ['lost', 'found'],
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Le message ne peut pas être vide'],
      maxlength: 2000,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ reportId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
