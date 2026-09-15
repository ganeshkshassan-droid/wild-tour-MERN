const mongoose = require('mongoose');
const { DEFAULT_SAFARI_CAPACITY } = require('../config/constants');

const safariSlotSchema = new mongoose.Schema(
  {
    safari_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Safari',
      required: true,
      index: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD for fast index matching and zero timezone ambiguity
      required: true,
      index: true,
    },
    shift: {
      type: String,
      enum: ['Morning', 'Evening', 'Full Day', 'Night'],
      required: true,
      index: true,
    },
    capacity: {
      type: Number,
      default: DEFAULT_SAFARI_CAPACITY || 6,
      min: [1, 'Slot capacity must be at least 1'],
    },
    booked_seats: {
      type: Number,
      default: 0,
      min: [0, 'Booked seats cannot be negative'],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound Unique Index: One slot per safari per date per shift
safariSlotSchema.index({ safari_id: 1, date: 1, shift: 1 }, { unique: true });

module.exports = mongoose.model('SafariSlot', safariSlotSchema);
