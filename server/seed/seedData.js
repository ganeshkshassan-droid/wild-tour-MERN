require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers to resolve MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Fail-soft if custom DNS cannot be configured
}

const User = require('../models/User');
const Safari = require('../models/Safari');
const Stay = require('../models/Stay');
const Package = require('../models/Package');
const Guide = require('../models/Guide');
const Booking = require('../models/Booking');
const SafariSlot = require('../models/SafariSlot');
const Review = require('../models/Review');
const AdminLog = require('../models/AdminLog');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wildtour_db');
    console.log('[MongoDB Connected for Seeding]');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  // CRITICAL PRODUCTION SAFETY GUARD
  if (process.env.NODE_ENV === 'production') {
    console.error('[FATAL CRITICAL ERROR]: Seeding script is strictly prohibited in production!');
    process.exit(1);
  }

  try {
    await connectDB();

    console.log('Clearing existing collections for fresh seed...');
    try {
      await mongoose.connection.db.collection('bookings').dropIndexes();
    } catch (e) {
      // Ignore if collection does not exist
    }
    await User.deleteMany({});
    await Safari.deleteMany({});
    await Stay.deleteMany({});
    await Package.deleteMany({});
    await Guide.deleteMany({});
    await Booking.deleteMany({});
    await SafariSlot.deleteMany({});
    await Review.deleteMany({});
    await AdminLog.deleteMany({});

    console.log('Seeding Users (with compliant 8+ char passwords)...');
    const adminUser = await User.create({
      name: 'Ganesh K S (Admin)',
      email: 'ganeshkshassan@gmail.com',
      phone: '9514789632',
      password: 'Ganesh212002#',
      address: 'Hassan / Bangalore, Karnataka',
      role: 'admin',
      isEmailVerified: true,
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    });

    const superAdmin = await User.create({
      name: 'Chief Forest Warden',
      email: 'admin@wildtour.com',
      phone: '9888800000',
      password: 'AdminMaster2026!',
      address: 'Nagarhole Forest HQ, Kabini',
      role: 'admin',
      isEmailVerified: true,
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    });

    const userRam = await User.create({
      name: 'Ram',
      email: 'ram@gmail.com',
      phone: '6985147856',
      password: 'RamPassword123#',
      address: 'Bangalore, Karnataka',
      role: 'user',
      isEmailVerified: true,
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    });

    const userAmbrutha = await User.create({
      name: 'Ambrutha',
      email: 'ambrutha@gmail.com',
      phone: '8521479632',
      password: 'AmbruthaPass2026#',
      address: 'Mumbai, Maharashtra',
      role: 'user',
      isEmailVerified: true,
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    });

    const userBhushan = await User.create({
      name: 'Bhushan',
      email: 'bhushan@gmail.com',
      phone: '9765342178',
      password: 'BhushanPass2026#',
      address: 'Mysore, Karnataka',
      role: 'user',
      isEmailVerified: true,
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    });

    console.log('Seeding Safaris (Distinct Names, Prices, and Images)...');
    const safaris = await Safari.insertMany([
      {
        name: '4x4 Predator Lion & Big Cat Gypsy Safari',
        image_url: '/images/jeep-safari-lion.jpg',
        price_per_seat: 1850,
        description: 'Thrilling open-top 4x4 off-road jungle expedition deep into core predator territories, alarm call tracks, and elephant crossings.',
        duration: '3.5 Hours',
        timing: 'Morning (06:00 AM - 09:30 AM) & Evening (03:30 PM - 06:30 PM)',
        vehicle_type: 'Custom 4x4 Open Safari Gypsy',
        max_seats: 6,
        category: 'Jeep',
        sighting_rating: 4.95,
        highlights: ['Zone A & B Core Predator Trail', 'Waterhole Tracking', 'Forest Department Permit', 'Certified Naturalist Driver'],
      },
      {
        name: 'Kabini River Emerald Boat Safari',
        image_url: '/images/lagoon-boat-safari.jpg',
        price_per_seat: 1250,
        description: 'Cruising the tranquil emerald backwaters of Kabini River observing marsh crocodiles, smooth-coated otters, and shoreline herds.',
        duration: '3.0 Hours',
        timing: 'Morning (06:30 AM) & Sunset (04:00 PM)',
        vehicle_type: 'Silent Electric Eco-Catamaran',
        max_seats: 12,
        category: 'Boat',
        sighting_rating: 4.85,
        highlights: ['Asian Elephant Shore Gathering', 'Mugger Crocodiles', 'Aquatic Bird Sanctuary', 'Sunset Reflections'],
      },
      {
        name: 'Savanna Grassland & Canopy Wildlife Trail',
        image_url: '/images/savanna-wildlife-safari.jpg',
        price_per_seat: 2100,
        description: 'Panoramic open grassland and deciduous woodland drive observing tall herbivores, chital herds, and raptor thermal flights.',
        duration: '4.0 Hours',
        timing: 'Dawn Drive (05:45 AM - 09:45 AM)',
        vehicle_type: 'Heavy-Duty 4x4 High-Stance Gypsy',
        max_seats: 6,
        category: 'Jeep',
        sighting_rating: 4.9,
        highlights: ['Wide Savanna Vista Views', 'Herbivore Migration Tracks', 'High-Powered Binoculars Provided', 'Gourmet Breakfast Box'],
      },
      {
        name: 'Twilight Acacia Sunset Safari',
        image_url: '/images/sunset-acacia-trail.jpg',
        price_per_seat: 1600,
        description: 'Exclusive twilight spotlight drive in the peripheral buffer zone encountering nocturnal hunters stirring at dusk.',
        duration: '2.5 Hours',
        timing: 'Dusk & Night (05:30 PM - 08:00 PM)',
        vehicle_type: 'Thermal-Equipped Covered 4x4',
        max_seats: 6,
        category: 'Night',
        sighting_rating: 4.75,
        highlights: ['Golden Hour Acacia Sunset', 'Thermal Night Spotlight', 'Civet & Slender Loris Tracking', 'Buffer Eco-Zone'],
      },
      {
        name: 'Elephant Back Heritage Wetland Trail',
        image_url: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1000&q=80',
        price_per_seat: 1400,
        description: 'Traditional morning safari atop trained forest department elephants traversing unmapped swamp wetlands and reed beds.',
        duration: '2.0 Hours',
        timing: 'Early Dawn (06:30 AM - 08:30 AM)',
        vehicle_type: 'Trained Department Elephant',
        max_seats: 4,
        category: 'Elephant',
        sighting_rating: 4.7,
        highlights: ['Swamp Crossing', 'Silent Herbivore Approach', 'Experienced Mahout Guide', 'Eco Heritage'],
      },
      {
        name: 'Saya Black Panther Deep Canopy Trail',
        image_url: '/images/black-panther.jpg',
        price_per_seat: 2400,
        description: 'Dedicated high-sighting tracking expedition deep into dense rainforest corridors where the famous melanistic leopard roams.',
        duration: '4.0 Hours',
        timing: 'Morning Dawn (06:00 AM - 10:00 AM)',
        vehicle_type: 'Silent 4x4 Open Safari Gypsy',
        max_seats: 6,
        category: 'Jeep',
        sighting_rating: 5.0,
        highlights: ['Melanistic Leopard Territory', 'Zone A Rainforest Corridors', 'Senior Master Tracker', 'Telephoto Lens Mounts'],
      },
    ]);

    console.log('Seeding Stays (Distinct Names, Prices, and Images)...');
    const stays = await Stay.insertMany([
      {
        name: 'The Serai Kabini Waterfront Estate Villa',
        image_url: '/images/waterfront-villa-stay.jpg',
        price_per_night: 6800,
        description: 'A luxurious retreat where the wilderness meets contemporary design with river-facing balconies, stone cottages, and private terraces.',
        location: 'Kura Riverbank, Sanctuary Border',
        room_type: 'Waterfront Stone Cottage & Private Terrace',
        rating: 4.9,
        amenities: ['Jacuzzi Villa', 'Wildlife Library', 'Kayaking Facility', 'Stargazing Telescope', 'Organic Restaurant'],
      },
      {
        name: 'Evolve Back Overwater Rainforest Bungalow',
        image_url: '/images/luxury-overwater-bungalow.jpg',
        price_per_night: 12500,
        description: 'Inspired by the local Kuruba tribal heritage, offering private plunge pools and sweeping panoramic views over the Kabini River waters.',
        location: 'Dammanakatte Core Riverfront, H.D. Kote',
        room_type: 'Luxury Overwater Villa with Plunge Pool',
        rating: 4.98,
        amenities: ['Private Plunge Pool', 'Ayurvedic Spa', 'Infinity Pool', 'Riverside Dining', 'Free High-Speed Wi-Fi'],
      },
      {
        name: 'Kabini River Lodge Maharaja Heritage',
        image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80',
        price_per_night: 4500,
        description: 'Ranked among the top wildlife lodges in Asia, the former hunting estate of the Maharaja of Mysore on the forest border.',
        location: 'Karapura Heritage Point, Nagarhole Range',
        room_type: 'Heritage Maharaja Bungalow Room',
        rating: 4.8,
        amenities: ['Viceroy Dining Hall', 'Jungle Bar', 'Daily Naturalist Talks', 'Campfire Circle', 'Riverside Hammocks'],
      },
      {
        name: 'Waterwoods Rainforest Eco-Resort',
        image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80',
        price_per_night: 8200,
        description: 'Eco-boutique lodge with 270-degree panoramic river vistas, organic estate farm dining, and direct wildlife viewing decks.',
        location: 'Nagarhole Buffer Zone, Karapura',
        room_type: 'Panoramic River View King Suite',
        rating: 4.85,
        amenities: ['Eco-Farm Dining', 'Open Air Cinema', 'Eco-Pool', 'Board Games Lounge', 'Mountain Bikes'],
      },
      {
        name: 'Kaav Luxury Canopy Treehouse & Glamping',
        image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80',
        price_per_night: 5600,
        description: 'Elevated canopy treehouses nestled under tall teak trees offering uninterrupted birdsong and jungle atmosphere.',
        location: 'Kabini Forest Fringe, Machur Gate',
        room_type: 'Luxury Canopy Treehouse Suite',
        rating: 4.78,
        amenities: ['Canopy Deck', 'Guided Birding Walk', 'Forest View Open Bath', 'Private Campfire', 'Chef Tasting Menu'],
      },
    ]);

    console.log('Seeding Packages (Distinct Names, Prices, and Images)...');
    const packages = await Package.insertMany([
      {
        name: 'Royal Maharaja All-Inclusive Sanctuary Expedition',
        image_url: '/images/luxury-overwater-bungalow.jpg',
        price: 28500,
        duration: '3 Days / 2 Nights',
        category: 'Luxury Safari',
        rating: 4.98,
        description: 'The ultimate royal wildlife getaway with luxury overwater bungalow stay, 3 private open-top jeep safaris, and a sunset boat cruise.',
        itinerary: [
          { day: 1, title: 'Arrival & Sunset Boat Cruise', details: 'Check-in at luxury waterfront villa, welcome drink, evening Kabini river cruise.' },
          { day: 2, title: 'Twin Jeep Safaris & Night Trail', details: 'Dawn Zone A safari, afternoon naturalist briefing, evening Zone B safari.' },
          { day: 3, title: 'Elephant Camp Visit & Departure', details: 'Morning elephant interaction, traditional breakfast, and check-out.' },
        ],
        inclusions: ['Luxury Stay (2 Nights)', '3 Core Safaris', 'All Gourmet Meals', 'Private Naturalist', 'Binocular Rental'],
      },
      {
        name: 'Predator Kingdom & Twilight Photography Tour',
        image_url: '/images/jeep-safari-lion.jpg',
        price: 19800,
        duration: '3 Days / 2 Nights',
        category: 'Photography Special',
        rating: 4.92,
        description: 'Specialized wildlife photography tour focused on big cat tracking, predator behavior, golden hour lighting, and camera vehicle support.',
        itinerary: [
          { day: 1, title: 'Check-in & Twilight Acacia Safari', details: 'Arrive by 01:00 PM, camera gear check, 04:30 PM sunset predator drive.' },
          { day: 2, title: 'Double Big Cat Corridor Drives', details: '05:45 AM Zone A dawn drive, photo review clinic, 03:30 PM Zone B drive.' },
          { day: 3, title: 'Canopy Birding & Departure', details: 'Morning riverfront birding walk, buffet breakfast, checkout by 12:00 PM.' },
        ],
        inclusions: ['Waterfront Estate Villa Stay (2 Nights)', '4 Dedicated Safaris', 'Vehicle Lens Mounts', 'Masterclass Session'],
      },
      {
        name: 'Kabini Big Cat Weekend Predator Trek',
        image_url: '/images/sunset-acacia-trail.jpg',
        price: 11500,
        duration: '2 Days / 1 Night',
        category: 'Weekend Special',
        rating: 4.85,
        description: 'Ideal weekend recharge with two dedicated 4x4 open gypsy drives focused on high tiger & leopard territory corridors.',
        itinerary: [
          { day: 1, title: 'Check-in & Evening Jeep Safari', details: 'Arrive by noon, lunch, 03:30 PM gypsy expedition into Zone A.' },
          { day: 2, title: 'Morning Dawn Safari & Checkout', details: '06:00 AM predator tracking drive, hot buffet breakfast, departure by 11:30 AM.' },
        ],
        inclusions: ['Heritage Cottage (1 Night)', '2 Jeep Safaris', 'Breakfast & Dinner', 'Forest Entry Permits'],
      },
      {
        name: 'Emerald Lagoon & Backwater Cruise Expedition',
        image_url: '/images/lagoon-boat-safari.jpg',
        price: 14200,
        duration: '2 Days / 1 Night',
        category: 'Waterfront Special',
        rating: 4.88,
        description: 'Waterfront holiday combining luxury riverboat cruises, otter tracking, and waterfront villa relaxation.',
        itinerary: [
          { day: 1, title: 'Waterfront Check-in & Evening Cruise', details: 'Welcome coconut water, check-in, 04:00 PM catamaran safari.' },
          { day: 2, title: 'Morning Wetland Safari & Breakfast', details: '06:30 AM riverboat expedition, poolside buffet breakfast, departure.' },
        ],
        inclusions: ['Waterfront Villa (1 Night)', '2 Riverboat Cruises', '1 Buffer Night Safari', 'All Meals & Transfers'],
      },
    ]);

    console.log('Seeding Guides (Distinct Names, Specialties, and Images)...');
    const guides = await Guide.insertMany([
      {
        name: 'Venkatesh Gowda (Chief Master Tracker)',
        bio: 'Over 15 years tracking Kabini leopards and tigers. Renowned master of alarm calls and territorial pugmark interpretation.',
        price: 1800,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        languages: ['English', 'Kannada', 'Tamil', 'Hindi'],
        experience_years: 15,
        rating: 4.95,
        specialty: 'Big Cat Pugmark Tracking & Alarm Call Analysis',
      },
      {
        name: 'Dr. Ananya Rao (Botanist & Ornithologist)',
        bio: 'Forest ecology researcher with encyclopedic knowledge of Nagarhole avian species, migratory flyways, and Western Ghats medicinal flora.',
        price: 2200,
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        languages: ['English', 'Kannada', 'Hindi'],
        experience_years: 9,
        rating: 4.9,
        specialty: 'Avian Tracking & Western Ghats Botanical Taxonomy',
      },
      {
        name: 'Ravi Somanna (Leopard Movement Specialist)',
        bio: 'Third-generation tracker specializing in leopard tree movements and predator behavior along the Dammanakatte corridor.',
        price: 2500,
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
        languages: ['English', 'Kannada'],
        experience_years: 11,
        rating: 4.92,
        specialty: 'Leopard Canopy Movement & Predator Behavior',
      },
    ]);

    console.log('Seeding Sample Safari Slots...');
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    await SafariSlot.insertMany([
      {
        safari_id: safaris[0]._id,
        date: todayStr,
        shift: 'Morning',
        capacity: 6,
        booked_seats: 4,
        active: true,
      },
      {
        safari_id: safaris[0]._id,
        date: todayStr,
        shift: 'Evening',
        capacity: 6,
        booked_seats: 2,
        active: true,
      },
      {
        safari_id: safaris[0]._id,
        date: tomorrowStr,
        shift: 'Morning',
        capacity: 6,
        booked_seats: 1,
        active: true,
      },
    ]);

    console.log('Seeding Backfilled Sample Bookings (with item_id & pricing_snapshot)...');
    const sampleBookings = await Booking.insertMany([
      {
        user: userAmbrutha._id,
        item_id: safaris[0]._id,
        item_type: 'Safari',
        item_name: safaris[0].name,
        item_image: safaris[0].image_url,
        tourist_name: 'Ambrutha',
        tourist_email: 'ambrutha@gmail.com',
        tourist_phone: '8521479632',
        num_persons: 2,
        safari_shift: 'Morning',
        pricing_snapshot: {
          base_price: 1850,
          quantity: 2,
          duration_multiplier: 1,
          subtotal: 3700,
          tax_rate: 0.05,
          tax_amount: 185,
          total_amount: 3885,
          currency: 'INR',
          calculated_at: new Date('2026-04-12T15:23:52Z'),
        },
        total_price: 3885,
        payment_mode: 'UPI / NetBanking',
        payment_status: 'Paid',
        status: 'Confirmed',
        check_in_status: 'NOT_CHECKED_IN',
        booking_date: new Date('2026-09-14'),
        ticket_number: 'WT-KABINI-001',
      },
      {
        user: userAmbrutha._id,
        item_id: packages[0]._id,
        item_type: 'Package',
        item_name: packages[0].name,
        item_image: packages[0].image_url,
        tourist_name: 'Ambrutha',
        tourist_email: 'ambrutha@gmail.com',
        num_persons: 2,
        pricing_snapshot: {
          base_price: 28500,
          quantity: 2,
          duration_multiplier: 1,
          subtotal: 57000,
          tax_rate: 0.05,
          tax_amount: 2850,
          total_amount: 59850,
          currency: 'INR',
          calculated_at: new Date('2026-04-12T15:41:01Z'),
        },
        total_price: 59850,
        payment_mode: 'Credit/Debit Card',
        payment_status: 'Paid',
        status: 'Completed',
        check_in_status: 'CHECKED_IN',
        from_date: new Date('2026-04-15'),
        to_date: new Date('2026-04-17'),
        ticket_number: 'WT-ROYAL-002',
      },
    ]);

    console.log('Seeding Sample Verified Review & Admin Log...');
    await Review.create({
      user: userAmbrutha._id,
      booking: sampleBookings[1]._id,
      item_id: packages[0]._id,
      item_type: 'Package',
      rating: 5,
      comment: 'An unforgettable royal expedition in Nagarhole! We spotted the big cat predator pride on our second morning safari.',
      traveler_name: 'Ambrutha',
      traveler_avatar: userAmbrutha.avatar,
      verified_expedition: true,
    });

    await AdminLog.create({
      actor_id: adminUser._id,
      actor_name: adminUser.name,
      action: 'SYSTEM_INITIALIZATION',
      target_type: 'System',
      details: 'Wild Tour Sanctuary reservation database successfully initialized with diverse safari, stay, and package inventory',
      ip_address: '127.0.0.1',
    });

    console.log('Database successfully seeded and backfilled with diverse non-repeating items!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
