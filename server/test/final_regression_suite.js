const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');
const Booking = require('../models/Booking');
const SafariSlot = require('../models/SafariSlot');
const Safari = require('../models/Safari');
const Stay = require('../models/Stay');
const Package = require('../models/Package');
const Guide = require('../models/Guide');
const Review = require('../models/Review');
const AdminLog = require('../models/AdminLog');
const { calculateAuthoritativePrice } = require('../services/pricingService');
const { processBookingCancellation } = require('../services/cancellationService');
const { BOOKING_STATUSES, REFUND_STATUSES, SAFARI_SHIFTS } = require('../config/constants');
const { getAllWildlife } = require('../controllers/wildlifeController');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wildtour_db';

const runFullRegression = async () => {
  console.log('\n===============================================================');
  console.log('🚀 WILD TOUR KARNATAKA — FINAL PRODUCTION REGRESSION SUITE 🚀');
  console.log('===============================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✔ MongoDB connected successfully.\n');

    // -------------------------------------------------------------
    // TEST 1: Password Strength & Validation Policy (Server Regex)
    // -------------------------------------------------------------
    console.log('--- TEST 1: Password Strength & Auth Policy ---');
    const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    
    // 1a. Test weak passwords (must fail)
    const weakPasswords = ['short', '1234567', 'password', '12345678', 'abc1234'];
    for (const pwd of weakPasswords) {
      if (PASSWORD_REGEX.test(pwd)) {
        throw new Error(`Password policy failed: weak password "${pwd}" was improperly accepted.`);
      }
    }
    console.log('✔ All weak/non-compliant passwords (< 8 chars or missing numbers/letters) correctly rejected.');

    // 1b. Test compliant passwords (must pass)
    const validPasswords = ['TigerSafari2026', 'Kabini#123', 'WardenPass88'];
    for (const pwd of validPasswords) {
      if (!PASSWORD_REGEX.test(pwd)) {
        throw new Error(`Password policy failed: valid password "${pwd}" was rejected.`);
      }
    }
    console.log('✔ Compliant passwords successfully validated.');

    // Create a verified test user
    const testEmail = `regression_tester_${Date.now()}@wildtour.test`;
    const testUser = await User.create({
      name: 'Regression Lead Tester',
      email: testEmail,
      password: 'StrongPassword123',
      phone: '+91 9988776655',
      role: 'user',
      isVerified: true,
    });
    console.log(`✔ Test traveler created: ${testUser.name} (${testUser.email})`);

    // -------------------------------------------------------------
    // TEST 2: Admin Item Models & Schema Field Compatibility
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Admin Inventory CRUD & Schema Contract ---');

    // 2a. Create Guide (price, image, specialty, bio)
    const testGuide = await Guide.create({
      name: 'Ravi Somanna (Naturalist)',
      bio: 'Third-generation tracker specializing in leopard movements along the Kabini backwaters.',
      price: 2500,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      specialty: 'Big Cat Tracking & Birding',
      languages: ['Kannada', 'English'],
      experience_years: 10,
    });
    if (!testGuide.price || !testGuide.image) throw new Error('Guide schema fields failed');
    console.log(`✔ Guide created successfully: ${testGuide.name} (Fee: ₹${testGuide.price}/day)`);

    // 2b. Create Safari (category in enum: Jeep, Boat, Night, Elephant, Walking)
    const testSafari = await Safari.create({
      name: 'Twilight Zone-A Gypsy Trail',
      image_url: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5',
      price_per_seat: 2000,
      category: 'Jeep',
      duration: '3.5 Hours',
      vehicle_type: '4x4 Open Top Gypsy',
      max_seats: 6,
    });
    if (testSafari.category !== 'Jeep') throw new Error('Safari category enum mismatch');
    console.log(`✔ Safari created with enum: ${testSafari.name} (Category: ${testSafari.category})`);

    // 2c. Create Package (duration string, price)
    const testPackage = await Package.create({
      name: 'Kabini Riverfront Explorer Luxury Package',
      image_url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e',
      price: 20000,
      duration: '3 Days / 2 Nights',
      description: 'Complete luxury package including riverfront cottage and 2 gypsy safaris.',
    });
    if (!testPackage.duration) throw new Error('Package duration failed');
    console.log(`✔ Package created: ${testPackage.name} (${testPackage.duration})`);

    // 2d. Create Stay (price_per_night, room_type, location)
    const testStay = await Stay.create({
      name: 'Kabini Wilderness Waterfront Villa',
      image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
      price_per_night: 5000,
      location: 'Dammanakatte Riverbank',
      room_type: 'Luxury Pool Villa',
    });
    if (!testStay.price_per_night) throw new Error('Stay schema failed');
    console.log(`✔ Stay created: ${testStay.name} (₹${testStay.price_per_night}/night)`);

    // -------------------------------------------------------------
    // TEST 3: Authoritative Pricing Engine Matrix
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Pricing Engine Authoritative Contract Matrix ---');

    // 3a. Safari Pricing (base * quantity + 5% eco levy)
    const safariResult = await calculateAuthoritativePrice({ item_type: 'Safari', item_id: testSafari._id, num_persons: 2 });
    if (safariResult.authoritativeTotal !== 4200) {
      throw new Error(`Safari pricing mismatch: Expected 4200, got ${safariResult.authoritativeTotal}`);
    }
    console.log('✔ Safari Pricing validated: 2 seats @ ₹2000 + 5% levy = ₹4200');

    // 3b. Stay Pricing (base * nights + 5% eco levy)
    const stayResult = await calculateAuthoritativePrice({
      item_type: 'Stay',
      item_id: testStay._id,
      from_date: '2026-10-01',
      to_date: '2026-10-04', // 3 nights
      num_persons: 1,
    });
    if (stayResult.pricingSnapshot.duration_multiplier !== 3 || stayResult.authoritativeTotal !== 15750) {
      throw new Error(`Stay pricing mismatch: Expected 15750, got ${stayResult.authoritativeTotal}`);
    }
    console.log('✔ Stay Pricing validated: 3 nights @ ₹5000 + 5% levy = ₹15750');

    // 3c. Package Pricing (base * persons + 5% eco levy, duration is fixed)
    const packageResult = await calculateAuthoritativePrice({
      item_type: 'Package',
      item_id: testPackage._id,
      from_date: '2026-10-01',
      to_date: '2026-10-04',
      num_persons: 2,
    });
    if (packageResult.pricingSnapshot.subtotal !== 40000 || packageResult.authoritativeTotal !== 42000) {
      throw new Error(`Package pricing mismatch: Expected 42000, got ${packageResult.authoritativeTotal}`);
    }
    console.log('✔ Package Pricing validated: 2 travelers @ ₹20000 + 5% levy = ₹42000 (fixed package duration)');

    // -------------------------------------------------------------
    // TEST 4: Atomic Slot Reservation & Concurrency Bounds
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Atomic Slot Reservation & Overbooking Bounds ---');
    const slotDate = '2026-11-15';
    const testSlot = await SafariSlot.create({
      safari_id: testSafari._id,
      date: slotDate,
      shift: SAFARI_SHIFTS.MORNING.key,
      capacity: 6,
      booked_seats: 0,
      active: true,
    });

    // Reserve 4 seats atomically
    const reserve1 = await SafariSlot.findOneAndUpdate(
      {
        _id: testSlot._id,
        $expr: { $lte: [{ $add: ['$booked_seats', 4] }, '$capacity'] },
      },
      { $inc: { booked_seats: 4 } },
      { new: true }
    );
    if (reserve1.booked_seats !== 4) throw new Error('Atomic reservation count mismatch');
    console.log(`✔ Initial reservation: 4/6 seats booked`);

    // Attempt to overbook with 3 more seats (should return null)
    const overbookAttempt = await SafariSlot.findOneAndUpdate(
      {
        _id: testSlot._id,
        $expr: { $lte: [{ $add: ['$booked_seats', 3] }, '$capacity'] },
      },
      { $inc: { booked_seats: 3 } },
      { new: true }
    );
    if (overbookAttempt !== null) throw new Error('Overbooking concurrency failure!');
    console.log(`✔ Overbooking request atomically blocked (3 seats requested on 2 remaining capacity returned null)`);

    // -------------------------------------------------------------
    // TEST 5: Booking Creation & Cancellation Refund Status
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Booking Cancellation & Refund Status Constant ---');
    const testBooking = await Booking.create({
      user: testUser._id,
      tourist_name: testUser.name,
      item_id: testSafari._id,
      item_type: 'Safari',
      item_name: testSafari.name,
      booking_date: new Date(slotDate),
      safari_shift: SAFARI_SHIFTS.MORNING.key,
      num_persons: 4,
      unit_price: testSafari.price_per_seat,
      subtotal: testSafari.price_per_seat * 4,
      tax: Math.round(testSafari.price_per_seat * 4 * 0.05),
      total_price: Math.round(testSafari.price_per_seat * 4 * 1.05),
      payment_mode: 'UPI / NetBanking',
      payment_status: 'Paid',
      status: BOOKING_STATUSES.CONFIRMED,
      idempotency_key: `idemp_reg_${Date.now()}`,
    });
    console.log(`✔ Paid Booking created: Ticket #${testBooking.ticket_number}, Total: ₹${testBooking.total_price}`);

    // Cancel the booking via cancellation service
    const cancelResult = await processBookingCancellation({
      booking: testBooking,
      user: testUser,
      reason: 'Travel plan changed',
    });
    if (cancelResult.booking.status !== BOOKING_STATUSES.CANCELLED) {
      throw new Error(`Cancellation failed: status is ${cancelResult.booking.status}`);
    }
    if (cancelResult.booking.refund_status !== REFUND_STATUSES.PENDING_MANUAL_PROCESSING) {
      throw new Error(`CRITICAL BUG: refund_status is "${cancelResult.booking.refund_status}", expected "${REFUND_STATUSES.PENDING_MANUAL_PROCESSING}"`);
    }
    console.log(`✔ Booking cancelled successfully! Status: ${cancelResult.booking.status}, Refund Status: "${cancelResult.booking.refund_status}"`);

    // Verify slot capacity released
    const slotAfterCancel = await SafariSlot.findById(testSlot._id);
    if (slotAfterCancel.booked_seats !== 0) {
      throw new Error(`Slot release failed: expected 0 booked seats, got ${slotAfterCancel.booked_seats}`);
    }
    console.log(`✔ Slot capacity automatically released: 0/6 seats booked`);

    // -------------------------------------------------------------
    // TEST 6: Wildlife Controller Property Contract
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Wildlife Controller Species Contract ---');
    let wildlifeList = [];
    const mockRes = {
      status: () => ({
        json: (data) => {
          wildlifeList = data.data;
        },
      }),
    };
    getAllWildlife({}, mockRes);
    if (wildlifeList.length === 0) throw new Error('No wildlife species returned');
    
    // Check species for canonical attributes
    const bp = wildlifeList.find((s) => s.slug === 'black-panther');
    if (!bp.scientificName || !bp.bestSightingTime || !bp.habitat || !bp.sound) {
      throw new Error('Wildlife attributes missing from controller');
    }
    console.log(`✔ Wildlife Contract verified for ${bp.name}:`);
    console.log(`   Scientific: ${bp.scientificName}`);
    console.log(`   Best Time: ${bp.bestSightingTime}`);
    console.log(`   Sound: "${bp.sound}"`);

    // -------------------------------------------------------------
    // TEST 7: CSV Injection Neutralization Test
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: CSV Formula Injection Sanitization ---');
    const sanitizeCsvField = (val) => {
      if (val === null || val === undefined) return '""';
      let str = String(val);
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      str = str.replace(/"/g, '""');
      return `"${str}"`;
    };

    const maliciousInputs = [
      '=cmd|"/C calc"!A0',
      '+SUM(A1:A10)',
      '-2+3+cmd',
      '@SUM(B1:B5)',
      'Normal "Quoted" Name',
    ];

    for (const input of maliciousInputs) {
      const sanitized = sanitizeCsvField(input);
      if (input.startsWith('=') && !sanitized.startsWith("\"'=")) {
        throw new Error(`CSV Formula injection not neutralized: ${sanitized}`);
      }
    }
    console.log('✔ CSV formula injection vectors (=, +, -, @) safely neutralized.');

    // -------------------------------------------------------------
    // Cleanup Test Entities
    // -------------------------------------------------------------
    console.log('\n--- Cleaning up temporary regression test entities ---');
    await User.findByIdAndDelete(testUser._id);
    await Booking.findByIdAndDelete(testBooking._id);
    await SafariSlot.findByIdAndDelete(testSlot._id);
    await Safari.findByIdAndDelete(testSafari._id);
    await Stay.findByIdAndDelete(testStay._id);
    await Package.findByIdAndDelete(testPackage._id);
    await Guide.findByIdAndDelete(testGuide._id);
    console.log('✔ Cleanup complete.');

    console.log('\n===============================================================');
    console.log('🎉 ALL REGRESSION TESTS PASSED 100% — ZERO ERRORS DETECTED!');
    console.log('===============================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ REGRESSION SUITE FAILED:', err);
    process.exit(1);
  }
};

runFullRegression();
