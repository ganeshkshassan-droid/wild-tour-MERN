const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Package name is required'],
      trim: true,
    },
    image_url: {
      type: String,
      required: true,
    },
    price: {
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
      default: '2 Days / 1 Night',
    },
    inclusions: {
      type: [String],
      default: [
        'Luxury Jungle Stay',
        '2 Guided Safaris (Jeep + Boat)',
        'All Gourmet Meals (Breakfast, Lunch, Dinner)',
        'Coracle Ride & Bird Watching',
        'Forest Entry & Wildlife Permits',
      ],
    },
    itinerary: {
      type: [
        {
          day: Number,
          title: String,
          activities: [String],
        },
      ],
      default: [
        {
          day: 1,
          title: 'Arrival, Coracle Ride & Evening Jeep Safari',
          activities: [
            '12:30 PM: Check-in & Welcome Herbal Drink',
            '01:30 PM: Traditional Buffet Lunch',
            '03:30 PM: Thrilling Evening Jungle Safari into Zone A',
            '07:30 PM: Wildlife Documentary & Campfire',
            '08:30 PM: Dinner under the stars',
          ],
        },
        {
          day: 2,
          title: 'Dawn Boat Safari & Departure',
          activities: [
            '06:00 AM: Morning Riverboat Safari to spot elephants & crocodiles',
            '08:30 AM: Lavish Breakfast',
            '10:30 AM: Guided Eco-Nature Trail Walk',
            '11:30 AM: Check-out with wild memories',
          ],
        },
      ],
    },
    rating: {
      type: Number,
      default: 4.95,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Package', packageSchema);
