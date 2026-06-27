const mongoose = require('mongoose');
const { CATEGORIES, FOUND_STATUSES } = require('../utils/constants');

const foundReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'La description est requise'],
      minlength: 10,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      enum: CATEGORIES,
      index: true,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    city: {
      type: String,
      required: [true, 'La ville est requise'],
      trim: true,
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    foundDate: {
      type: Date,
      required: [true, 'La date de découverte est requise'],
    },
    status: {
      type: String,
      enum: FOUND_STATUSES,
      default: 'active',
      index: true,
    },
    heldAt: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

foundReportSchema.index({ location: '2dsphere' });
foundReportSchema.index({ title: 'text', description: 'text' });
foundReportSchema.index({ category: 1, city: 1, status: 1 });

module.exports = mongoose.model('FoundReport', foundReportSchema);
