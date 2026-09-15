const SafariSlot = require('../models/SafariSlot');
const { BOOKING_STATUSES, REFUND_STATUSES } = require('../config/constants');
const { sendBookingCancellationEmail } = require('../utils/emailService');

/**
 * Centralized Cancellation & Slot Release Service
 */
const processBookingCancellation = async ({ booking, user, reason = 'Traveler schedule change' }) => {
  // 1. Authorization & Ownership Validation
  const isOwner = booking.user && booking.user.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new Error('Unauthorized: You can only cancel your own sanctuary reservations');
  }

  // 2. State Machine Validation
  if (booking.status === BOOKING_STATUSES.CANCELLED) {
    throw new Error('This booking permit is already cancelled');
  }

  if (booking.status === BOOKING_STATUSES.COMPLETED) {
    throw new Error('Completed expeditions cannot be cancelled');
  }

  // 3. Calculate Cancellation Policy & Refund Eligibility
  const bookingDate = new Date(booking.booking_date || booking.from_date || booking.createdAt);
  const now = new Date();
  const hoursUntilTrip = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  let refund_percentage = 100;
  if (hoursUntilTrip < 24 && hoursUntilTrip > 0) {
    refund_percentage = 50; // 50% refund for last-minute cancellations (< 24h)
  } else if (hoursUntilTrip <= 0) {
    refund_percentage = 0; // 0% refund on or after trip date
  }

  const baseTotal = booking.total_price || 0;
  const calculatedRefundAmount = Math.round((baseTotal * refund_percentage) / 100);

  // Decoupled refund tracking: if payment was Pay on Arrival or not paid, no monetary refund is applicable
  let newRefundStatus = REFUND_STATUSES.NOT_APPLICABLE;
  if (booking.payment_status === 'Paid' && calculatedRefundAmount > 0) {
    newRefundStatus = REFUND_STATUSES.PENDING_MANUAL_PROCESSING;
  }

  // 4. Atomic Safari Slot Release (if item is Safari)
  if (booking.item_type === 'Safari' && booking.item_id && booking.booking_date) {
    const shift = booking.safari_shift || 'Morning';
    const dateStr = new Date(booking.booking_date).toISOString().split('T')[0];

    await SafariSlot.findOneAndUpdate(
      {
        safari_id: booking.item_id,
        date: dateStr,
        shift: shift,
        booked_seats: { $gte: booking.num_persons || 1 },
      },
      {
        $inc: { booked_seats: -(booking.num_persons || 1) },
      }
    );
  }

  // 5. Update Booking Document
  booking.status = BOOKING_STATUSES.CANCELLED;
  booking.refund_status = newRefundStatus;
  booking.refund_amount = calculatedRefundAmount;
  booking.cancellation_reason = reason;
  booking.cancelled_at = new Date();
  booking.cancelled_by = user._id;
  await booking.save();

  // 6. Dispatch Cancellation Notification Email safely
  const recipientEmail = booking.tourist_email || user.email;
  if (recipientEmail && sendBookingCancellationEmail) {
    try {
      sendBookingCancellationEmail({
        to: recipientEmail,
        booking,
        user,
      });
    } catch (err) {
      console.warn('[Cancellation Email Dispatch Warning]:', err.message);
    }
  }

  return {
    success: true,
    booking,
    refund_percentage,
    refund_amount: calculatedRefundAmount,
    refund_status: newRefundStatus,
  };
};

module.exports = {
  processBookingCancellation,
};
