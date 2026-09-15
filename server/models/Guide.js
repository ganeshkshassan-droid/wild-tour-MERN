const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Guide service name is required'],
      trim: true,
    },
    bio: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      required: true,
    },
    languages: {
      type: [String],
      default: ['English', 'Kannada', 'Hindi'],
    },
    experience_years: {
      type: Number,
      default: 8,
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    specialty: {
      type: String,
      default: 'Big Cat Tracking & Birding',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Guide', guideSchema);
