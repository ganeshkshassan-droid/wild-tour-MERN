/**
 * Wild Tour Karnataka - Centralized System Constants & Business Rules
 * Source of truth for pricing rates, capacities, shifts, and policy configurations.
 */

module.exports = {
  // Eco-Conservation Levy (5% of Subtotal)
  ECO_LEVY_RATE: 0.05,

  // Default Safari Vehicle Capacity (6 seats per 4x4 open gypsy)
  DEFAULT_SAFARI_CAPACITY: 6,

  // Standard Safari Shifts
  SAFARI_SHIFTS: {
    MORNING: {
      key: 'Morning',
      label: 'Morning Dawn Trail',
      time: '06:00 AM - 09:30 AM',
    },
    EVENING: {
      key: 'Evening',
      label: 'Evening Predator Drive',
      time: '03:30 PM - 06:30 PM',
    },
    NIGHT: {
      key: 'Night',
      label: 'Night Buffer Safari',
      time: '07:30 PM - 10:00 PM',
    },
    FULL_DAY: {
      key: 'Full Day',
      label: 'Full Day Jungle Expedition',
      time: '06:00 AM - 06:00 PM',
    },
  },

  // Booking Lifecycle State Machine
  BOOKING_STATUSES: {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  },

  // Payment Statuses
  PAYMENT_STATUSES: {
    PAID: 'Paid',
    PENDING: 'Pending',
    REFUNDED: 'Refunded',
    PAY_ON_ARRIVAL: 'Pay on Arrival',
  },

  // Gate Check-in Statuses (Decoupled from Trip Completion)
  CHECK_IN_STATUSES: {
    NOT_CHECKED_IN: 'NOT_CHECKED_IN',
    CHECKED_IN: 'CHECKED_IN',
  },

  // Refund Lifecycle Statuses
  REFUND_STATUSES: {
    NOT_APPLICABLE: 'Not Applicable',
    PENDING_MANUAL_PROCESSING: 'Pending Manual Processing',
    REFUNDED: 'Refunded',
  },

  // Currency
  DEFAULT_CURRENCY: 'INR',

  // Auth & Token Expiries
  AUTH_TOKEN_EXPIRY: '30d',
  PASSWORD_RESET_TOKEN_EXPIRY: '15m',
  OTP_EXPIRY_MS: 10 * 60 * 1000, // 10 minutes
  OTP_RESEND_COOLDOWN_MS: 60 * 1000, // 60 seconds
  MAX_OTP_ATTEMPTS: 5,
};
