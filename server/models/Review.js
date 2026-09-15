const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'item_type',
      required: true,
      index: true,
    },
    item_type: {
      type: String,
      enum: ['Safari', 'Stay', 'Package', 'Guide'],
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a star rating from 1 to 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please write a brief summary of your wildlife experience'],
      minlength: [5, 'Review must be at least 5 characters long'],
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
      trim: true,
    },
    traveler_name: {
      type: String,
      required: true,
    },
    traveler_avatar: {
      type: String,
      default: '',
    },
    verified_expedition: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// One review per verified booking
reviewSchema.index({ user: 1, booking: 1 }, { unique: true });
reviewSchema.index({ item_id: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
