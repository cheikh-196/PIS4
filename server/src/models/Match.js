const mongoose = require('mongoose');
const { MATCH_STATUSES } = require('../utils/constants');

const matchSchema = new mongoose.Schema(
  {
    lostReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LostReport',
      required: true,
    },
    foundReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoundReport',
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    status: {
      type: String,
      enum: MATCH_STATUSES,
      default: 'pending',
    },
    notifiedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

matchSchema.index({ lostReport: 1, foundReport: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
