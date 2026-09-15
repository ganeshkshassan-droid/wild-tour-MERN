const mongoose = require('mongoose');

const staySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Stay name is required'],
      trim: true,
    },
    image_url: {
      type: String,
      required: true,
    },
    price_per_night: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: 'Kabini Riverfront, Nagarhole National Park',
    },
    room_type: {
      type: String,
      default: 'Luxury Pool Villa / Riverfront Cottage',
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    amenities: {
      type: [String],
      default: ['Infinity Pool', 'All Meals Included', 'Free High-Speed Wi-Fi', 'Nature Walk', 'Campfire Evening', 'Ayurvedic Spa'],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Stay', staySchema);
