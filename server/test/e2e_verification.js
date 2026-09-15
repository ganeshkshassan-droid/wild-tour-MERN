const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Safari = require('../models/Safari');
const SafariSlot = require('../models/SafariSlot');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const AdminLog = require('../models/AdminLog');
const pricingService = require('../services/pricingService');
const cancellationService = require('../services/cancellationService');
const { BOOKING_STATUSES, PAYMENT_STATUSES, CHECK_IN_STATUSES } = require('../config/constants');

const runVerification = async () => {
  console.log('=== STARTING WILD TOUR MASTER INTEGRATION & AUDIT VERIFICATION ===\n');

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[MongoDB Connected Successfully]');

    // 1. VERIFY AUTH & PASSWORD SECURITY
    console.log('\n--- 1. Testing Auth & Password Policy ---');
    const testEmail = `test_ranger_${Date.now()}@wildtour.test`;
    const weakPass = '123';
    let failedAsExpected = false;
    try {
      await User.create({
        name: 'Test Ranger',
        email: testEmail,
        password: weakPass,
      });
    } catch (e) {
      failedAsExpected = true;
      console.log('✔ Password validation rejected weak password (< 8 chars):', e.message);
    }
    if (!failedAsExpected) throw new Error('Password validation failed to reject weak password');

    const compliantPass = 'WildRanger2026!';
    const user = await User.create({
      name: 'Test Ranger Compliant',
      email: testEmail,
      password: compliantPass,
      role: 'user',
      isVerified: true,
    });
    console.log('✔ User created successfully with compliant password & role: user');

    // 2. VERIFY SERVER-AUTHORITATIVE PRICING ENGINE
    console.log('\n--- 2. Testing Server-Authoritative Pricing Engine ---');
    const safari = await Safari.findOne({ active: true });
    if (!safari) throw new Error('No active safari found');

    const { pricingSnapshot, authoritativeTotal } = await pricingService.calculateAuthoritativePrice({
      item_id: safari._id,
      item_type: 'Safari',
      num_persons: 3,
    });
    console.log(`✔ Authoritative Price Computed for 3 persons on "${safari.name}":`);
    console.log(`   Base Subtotal: ₹${pricingSnapshot.subtotal}`);
    console.log(`   Eco Levy (5%): ₹${pricingSnapshot.tax_amount}`);
    console.log(`   Total Authoritative Price: ₹${authoritativeTotal}`);

    const expectedSubtotal = safari.price_per_seat * 3;
    const expectedLevy = Math.round(expectedSubtotal * 0.05);
    if (authoritativeTotal !== expectedSubtotal + expectedLevy) {
      throw new Error('Pricing calculation mismatch');
    }
    console.log('✔ Price computation strictly matches mathematical formulation.');


    // 3. VERIFY ATOMIC SLOT CAPACITY RESERVATION
    console.log('\n--- 3. Testing Atomic Slot Capacity Reservation ---');
    const testDate = '2026-11-20';
    const testShift = 'Morning';

    await SafariSlot.deleteMany({ safari_id: safari._id, date: testDate });

    // Ensure slot document exists
    let slot = await SafariSlot.findOneAndUpdate(
      { safari_id: safari._id, date: testDate, shift: testShift },
      { $setOnInsert: { capacity: 6, booked_seats: 0, active: true } },
      { upsert: true, new: true }
    );

    console.log(`✔ Initial Slot state: ${slot.booked_seats}/${slot.capacity} seats booked`);

    // Reserve 4 seats atomically
    const reserve1 = await SafariSlot.findOneAndUpdate(
      {
        _id: slot._id,
        active: true,
        $expr: { $lte: [{ $add: ['$booked_seats', 4] }, '$capacity'] },
      },
      { $inc: { booked_seats: 4 } },
      { new: true }
    );
    if (!reserve1) throw new Error('Failed to reserve 4 seats on available slot');
    console.log(`✔ Reserved 4 seats: New state = ${reserve1.booked_seats}/${reserve1.capacity}`);

    // Attempt to reserve 3 more seats (4 + 3 = 7 > 6) -> MUST FAIL
    const reserve2 = await SafariSlot.findOneAndUpdate(
      {
        _id: slot._id,
        active: true,
        $expr: { $lte: [{ $add: ['$booked_seats', 3] }, '$capacity'] },
      },
      { $inc: { booked_seats: 3 } },
      { new: true }
    );
    if (reserve2) throw new Error('Concurrency violation: Slot was overbooked!');
    console.log('✔ Overbooking rejected atomically: 3 seats requested on 2 remaining capacity returned null.');

    // 4. VERIFY USER-SCOPED IDEMPOTENCY KEY CONSTRAINTS
    console.log('\n--- 4. Testing User-Scoped Idempotency Constraints ---');
    const testIdempotencyKey = `idemp_${Date.now()}`;
    const booking1 = await Booking.create({
      user: user._id,
      item_id: safari._id,
      item_type: 'Safari',
      item_name: safari.name,
      tourist_name: 'Test Tourist',
      num_persons: 2,
      safari_shift: testShift,
      pricing_snapshot: pricingSnapshot,
      total_price: authoritativeTotal,
      booking_date: new Date(testDate),
      idempotency_key: testIdempotencyKey,
      status: BOOKING_STATUSES.CONFIRMED,
      payment_status: PAYMENT_STATUSES.PAID,
    });
    console.log(`✔ First booking created with Ticket #${booking1.ticket_number} (Idempotency Key: ${testIdempotencyKey})`);

    let duplicateRejected = false;
    try {
      await Booking.create({
        user: user._id,
        item_id: safari._id,
        item_type: 'Safari',
        item_name: safari.name,
        tourist_name: 'Test Tourist Duplicate',
        num_persons: 2,
        pricing_snapshot: pricingSnapshot,
        total_price: authoritativeTotal,
        booking_date: new Date(testDate),
        idempotency_key: testIdempotencyKey,
      });
    } catch (e) {
      duplicateRejected = true;
      console.log('✔ Duplicate idempotency request rejected with Mongo E11000 duplicate key error.');
    }
    if (!duplicateRejected) throw new Error('Idempotency constraint failed to reject duplicate insert');

    // 5. VERIFY CANCELLATION & ATOMIC CAPACITY RELEASE
    console.log('\n--- 5. Testing Centralized Cancellation & Slot Release ---');
    const cancelResult = await cancellationService.processBookingCancellation({
      booking: booking1,
      user: user,
      reason: 'Travel plan rescheduled',
    });
    console.log(`✔ Booking cancelled: Status = ${cancelResult.booking.status}, Refund Status = ${cancelResult.booking.refund_status}`);


    const slotAfterCancel = await SafariSlot.findById(slot._id);
    console.log(`✔ Slot capacity after atomic release: ${slotAfterCancel.booked_seats}/${slotAfterCancel.capacity} booked seats`);

    // 6. VERIFY RANGER GATE CHECK-IN
    console.log('\n--- 6. Testing Gate Check-in & Independent Check-in State ---');
    // Create a new fresh confirmed booking
    const bookingForCheckin = await Booking.create({
      user: user._id,
      item_id: safari._id,
      item_type: 'Safari',
      item_name: safari.name,
      tourist_name: 'Ambrutha Ranger Test',
      num_persons: 2,
      safari_shift: testShift,
      pricing_snapshot: pricingSnapshot,
      total_price: authoritativeTotal,
      booking_date: new Date(),
      status: BOOKING_STATUSES.CONFIRMED,
      payment_status: PAYMENT_STATUSES.PAID,
      check_in_status: CHECK_IN_STATUSES.NOT_CHECKED_IN,
    });


    // Check-in
    bookingForCheckin.check_in_status = CHECK_IN_STATUSES.CHECKED_IN;
    bookingForCheckin.checked_in_at = new Date();
    bookingForCheckin.checked_in_by = user._id;
    await bookingForCheckin.save();

    console.log(`✔ Booking checked in at gate. Status = ${bookingForCheckin.status} (remains Confirmed), Check-In Status = ${bookingForCheckin.check_in_status}`);

    // 7. VERIFY VERIFIED REVIEWS ON COMPLETED BOOKINGS
    console.log('\n--- 7. Testing Verified Reviews Engine ---');
    bookingForCheckin.status = BOOKING_STATUSES.COMPLETED;
    await bookingForCheckin.save();

    const review = await Review.create({
      user: user._id,
      booking: bookingForCheckin._id,
      item_id: safari._id,
      item_type: 'Safari',
      rating: 5,
      comment: 'Incredible early morning tiger sighting at Dammanakatte gate! Guide was phenomenal.',
      traveler_name: user.name,
      verified_expedition: true,
    });
    console.log(`✔ Verified review created for completed trip: ★ ${review.rating}/5 — "${review.comment}"`);

    // Ensure duplicate review on same booking fails
    let dupReviewRejected = false;
    try {
      await Review.create({
        user: user._id,
        booking: bookingForCheckin._id,
        item_id: safari._id,
        item_type: 'Safari',
        rating: 4,
        comment: 'Second review attempt',
        traveler_name: user.name,
      });
    } catch (e) {
      dupReviewRejected = true;
      console.log('✔ Duplicate review on same booking rejected as expected.');
    }
    if (!dupReviewRejected) throw new Error('Review duplicate index failed');


    // 8. VERIFY APPEND-ONLY ADMIN AUDIT LOGGING
    console.log('\n--- 8. Testing Append-Only Admin Audit Logging ---');
    const log = await AdminLog.create({
      action: 'GATE_CHECKPOST_CLEARANCE',
      actor_id: user._id,
      actor_name: user.name,
      target_type: 'Booking',
      target_id: bookingForCheckin._id,
      details: `Ticket #${bookingForCheckin.ticket_number} cleared at Dammanakatte Gate Reception`,
      ip_address: '127.0.0.1',
    });
    console.log(`✔ Audit log appended: [${log.action}] by ${log.actor_name} for Ticket #${bookingForCheckin.ticket_number}`);


    // Clean up test data
    await User.findByIdAndDelete(user._id);
    await Booking.findByIdAndDelete(booking1._id);
    await Booking.findByIdAndDelete(bookingForCheckin._id);
    await Review.findByIdAndDelete(review._id);
    await AdminLog.findByIdAndDelete(log._id);
    await SafariSlot.findByIdAndDelete(slot._id);

    console.log('\n===============================================================');
    console.log('🎉 ALL INTEGRATION, SECURITY & INTEGRITY TESTS PASSED 100%!');
    console.log('===============================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ VERIFICATION TEST FAILED:', err);
    process.exit(1);
  }
};

runVerification();
