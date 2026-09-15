const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    item_type: {
      type: String,
      required: true,
      enum: ['Safari', 'Stay', 'Package', 'Guide'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate saves per user
wishlistSchema.index({ user: 1, item_id: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
