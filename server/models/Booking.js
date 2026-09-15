const mongoose = require('mongoose');
const crypto = require('crypto');
const { BOOKING_STATUSES, PAYMENT_STATUSES, CHECK_IN_STATUSES, REFUND_STATUSES } = require('../config/constants');

// Crypto-secure, collision-resistant ticket number generator (e.g. WT-L7K8X9-A3F1)
const generateTicketNumber = () => {
  const timeHex = Date.now().toString(36).toUpperCase();
  const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `WT-${timeHex}-${randomHex}`;
};

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Nullable reference for backwards compatibility and safe non-destructive migration
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'item_type',
      default: null,
      index: true,
    },
    item_type: {
      type: String,
      enum: ['Safari', 'Stay', 'Package', 'Guide'],
      required: true,
    },
    item_name: {
      type: String,
      required: true,
      trim: true,
    },
    item_image: {
      type: String,
      default: '',
    },
    tourist_name: {
      type: String,
      required: true,
      trim: true,
    },
    tourist_email: {
      type: String,
      trim: true,
      default: '',
    },
    tourist_phone: {
      type: String,
      trim: true,
      default: '',
    },
    num_persons: {
      type: Number,
      required: true,
      min: [1, 'Must book for at least 1 person'],
    },
    // Safari Shift (Morning Dawn Trail vs Evening Predator Drive)
    safari_shift: {
      type: String,
      enum: ['Morning', 'Evening', 'Full Day', 'Night', 'N/A'],
      default: 'Morning',
    },
    // Authoritative Immutable Pricing Snapshot
    pricing_snapshot: {
      base_price: { type: Number, default: 0 },
      quantity: { type: Number, default: 1 },
      duration_multiplier: { type: Number, default: 1 },
      subtotal: { type: Number, default: 0 },
      tax_rate: { type: Number, default: 0.05 },
      tax_amount: { type: Number, default: 0 },
      total_amount: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      calculated_at: { type: Date, default: Date.now },
    },
    total_price: {
      type: Number,
      required: true,
      min: 0,
    },
    payment_mode: {
      type: String,
      enum: ['Cash', 'Credit/Debit Card', 'UPI / NetBanking', 'Pay on Arrival'],
      default: 'UPI / NetBanking',
    },
    payment_status: {
      type: String,
      enum: Object.values(PAYMENT_STATUSES) || ['Paid', 'Pending', 'Refunded', 'Pay on Arrival'],
      default: 'Paid',
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUSES) || ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Confirmed',
      index: true,
    },
    // Decoupled Ranger Gate Check-In Status
    check_in_status: {
      type: String,
      enum: Object.values(CHECK_IN_STATUSES) || ['NOT_CHECKED_IN', 'CHECKED_IN'],
      default: 'NOT_CHECKED_IN',
    },
    checked_in_at: {
      type: Date,
      default: null,
    },
    checked_in_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Cancellation & Refund Tracking
    refund_status: {
      type: String,
      enum: Object.values(REFUND_STATUSES) || ['Not Applicable', 'Pending Manual Processing', 'Refunded'],
      default: 'Not Applicable',
    },
    refund_amount: {
      type: Number,
      default: 0,
    },
    cancellation_reason: {
      type: String,
      default: '',
    },
    cancelled_at: {
      type: Date,
      default: null,
    },
    cancelled_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Dates
    booking_date: {
      type: Date,
      default: null,
    },
    from_date: {
      type: Date,
      default: null,
    },
    to_date: {
      type: Date,
      default: null,
    },
    special_requests: {
      type: String,
      default: '',
    },
    ticket_number: {
      type: String,
      unique: true,
      default: generateTicketNumber,
    },
    idempotency_key: {
      type: String,
      default: null,
    },
    confirmationEmailSent: {
      type: Boolean,
      default: false,
    },
    cancellationEmailSent: {
      type: Boolean,
      default: false,
    },
    booked_date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// High-Performance Query Indexes
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ item_id: 1, booking_date: 1, safari_shift: 1 });
bookingSchema.index(
  { user: 1, idempotency_key: 1 },
  { unique: true, partialFilterExpression: { idempotency_key: { $type: 'string' } } }
);

module.exports = mongoose.model('Booking', bookingSchema);


