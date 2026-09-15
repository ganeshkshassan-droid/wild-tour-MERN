const mongoose = require('mongoose');

const safariSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Safari name is required'],
      trim: true,
    },
    image_url: {
      type: String,
      required: true,
    },
    price_per_seat: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '3 - 4 Hours',
    },
    timing: {
      type: String,
      default: 'Morning (06:00 AM - 09:30 AM) & Evening (03:30 PM - 06:30 PM)',
    },
    vehicle_type: {
      type: String,
      default: '4x4 Open Top Gypsy',
    },
    max_seats: {
      type: Number,
      default: 6,
    },
    highlights: {
      type: [String],
      default: ['Deep Forest Trail', 'Zone-A Wildlife Corridor', 'Expert Forest Driver', 'Permit Included'],
    },
    sighting_rating: {
      type: Number,
      default: 4.8,
    },
    category: {
      type: String,
      enum: ['Jeep', 'Elephant', 'Boat', 'Walking', 'Night'],
      default: 'Jeep',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Safari', safariSchema);
