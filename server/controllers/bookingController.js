const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Safari = require('../models/Safari');
const Stay = require('../models/Stay');
const Package = require('../models/Package');
const Guide = require('../models/Guide');
const SafariSlot = require('../models/SafariSlot');
const AdminLog = require('../models/AdminLog');
const { calculateAuthoritativePrice } = require('../services/pricingService');
const { processBookingCancellation } = require('../services/cancellationService');
const { sendBookingConfirmationEmail } = require('../utils/emailService');
const {
  DEFAULT_SAFARI_CAPACITY,
  BOOKING_STATUSES,
  CHECK_IN_STATUSES,
} = require('../config/constants');

// Formula injection sanitizer for CSV exports
const sanitizeCsvField = (val) => {
  if (val === null || val === undefined) return '""';
  let str = String(val).trim();
  // Neutralize spreadsheet formula injection characters
  if (/^[=+@-]/i.test(str)) {
    str = `'${str}`;
  }
  // Escape double quotes
  return `"${str.replace(/"/g, '""')}"`;
};

// @desc    Create new booking with Authoritative Server-Side Pricing & Atomic Slot Concurrency Guard
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const {
      tourist_name,
      tourist_phone,
      item_type,
      item_id,
      item_name,
      item_image,
      num_persons,
      safari_shift = 'Morning',
      payment_mode,
      booking_date,
      from_date,
      to_date,
      special_requests,
      idempotency_key,
    } = req.body;

    // 1. Basic Payload Validation
    if (!tourist_name || !item_type || (!item_id && !item_name) || !num_persons) {
      return res.status(400).json({
        success: false,
        message: 'Please provide lead tourist name, inventory category, item identifier, and traveler headcount',
      });
    }

    const requestedSeats = Math.max(1, parseInt(num_persons, 10) || 1);

    // 2. Date Validations
    if (from_date && to_date) {
      const start = new Date(from_date);
      const end = new Date(to_date);
      if (end <= start) {
        return res.status(400).json({
          success: false,
          message: 'Check-out date must be strictly after check-in date',
        });
      }
    }

    // 3. User-Scoped Idempotency Guard
    if (idempotency_key) {
      const existingBooking = await Booking.findOne({
        user: req.user._id,
        idempotency_key: String(idempotency_key).trim(),
      });

      if (existingBooking) {
        // Compare essential parameters to detect replay vs conflict
        const isSameCategory = existingBooking.item_type === item_type;
        const isSameHeadcount = existingBooking.num_persons === requestedSeats;

        if (isSameCategory && isSameHeadcount) {
          return res.status(200).json({
            success: true,
            message: 'Booking retrieved via idempotency token',
            booking: existingBooking,
          });
        } else {
          return res.status(409).json({
            success: false,
            message: 'Idempotency Key Conflict: this idempotency key was previously processed with different booking parameters.',
          });
        }
      }
    }

    // 4. Calculate Server-Authoritative Price & Snapshot
    const { inventoryItem, pricingSnapshot, authoritativeTotal } = await calculateAuthoritativePrice({
      item_type,
      item_id,
      item_name,
      num_persons: requestedSeats,
      from_date,
      to_date,
    });

    const isSafari = (item_type || '').toLowerCase() === 'safari';
    let dateStr = '';
    const shift = safari_shift || 'Morning';

    // 5. Atomic Slot Reservation (Safaris Only)
    if (isSafari) {
      const targetDate = booking_date ? new Date(booking_date) : (from_date ? new Date(from_date) : new Date());
      dateStr = targetDate.toISOString().split('T')[0];
      const slotCapacity = inventoryItem.max_seats || DEFAULT_SAFARI_CAPACITY || 6;

      // Ensure slot document exists (upsert without changing booked_seats)
      await SafariSlot.findOneAndUpdate(
        { safari_id: inventoryItem._id, date: dateStr, shift },
        { $setOnInsert: { capacity: slotCapacity, booked_seats: 0, active: true } },
        { upsert: true, new: true }
      );

      // Atomic reservation with concurrency condition: booked_seats + requestedSeats <= capacity
      const reservedSlot = await SafariSlot.findOneAndUpdate(
        {
          safari_id: inventoryItem._id,
          date: dateStr,
          shift,
          active: true,
          $expr: { $lte: [{ $add: ['$booked_seats', requestedSeats] }, '$capacity'] },
        },
        { $inc: { booked_seats: requestedSeats } },
        { new: true }
      );

      if (!reservedSlot) {
        // Query slot to get exact remaining capacity for feedback
        const currentSlot = await SafariSlot.findOne({ safari_id: inventoryItem._id, date: dateStr, shift });
        const remaining = currentSlot ? Math.max(0, currentSlot.capacity - currentSlot.booked_seats) : 0;

        return res.status(400).json({
          success: false,
          message: `Safari shift is sold out or has insufficient capacity. Only ${remaining} seat(s) remaining for ${shift} on ${dateStr}.`,
        });
      }
    }

    // 6. Create Booking Document (with compensating action on DB error)
    let booking;
    try {
      booking = await Booking.create({
        user: req.user._id,
        item_id: inventoryItem._id,
        item_type,
        item_name: inventoryItem.name || item_name,
        item_image: item_image || inventoryItem.image || inventoryItem.image_url || '',
        tourist_name: tourist_name.trim(),
        tourist_email: req.user.email,
        tourist_phone: tourist_phone ? tourist_phone.trim() : (req.user.phone || ''),
        num_persons: requestedSeats,
        safari_shift: shift,
        pricing_snapshot: pricingSnapshot,
        total_price: authoritativeTotal,
        payment_mode: payment_mode || 'UPI / NetBanking',
        payment_status: payment_mode === 'Pay on Arrival' ? 'Pay on Arrival' : 'Paid',
        status: BOOKING_STATUSES.CONFIRMED,
        check_in_status: CHECK_IN_STATUSES.NOT_CHECKED_IN,
        booking_date: booking_date || from_date || new Date(),
        from_date: from_date || null,
        to_date: to_date || null,
        special_requests: special_requests ? special_requests.trim() : '',
        idempotency_key: idempotency_key ? String(idempotency_key).trim() : null,
      });
    } catch (dbError) {
      // Compensating Action: Release reserved seats if booking insert failed
      if (isSafari && inventoryItem) {
        await SafariSlot.findOneAndUpdate(
          { safari_id: inventoryItem._id, date: dateStr, shift },
          { $inc: { booked_seats: -requestedSeats } }
        ).catch((compErr) => console.error('[Compensating Slot Release Error]:', compErr.message));
      }
      throw dbError;
    }

    // 7. Dispatch Confirmation Email Asynchronously
    const bookingToNotify = await Booking.findOneAndUpdate(
      { _id: booking._id, confirmationEmailSent: { $ne: true } },
      { $set: { confirmationEmailSent: true } }
    );

    if (bookingToNotify && req.user && req.user.email) {
      sendBookingConfirmationEmail({
        to: req.user.email,
        booking,
        user: req.user,
      }).catch((e) => console.warn('[Async Booking Email Notice]:', e.message));
    }

    res.status(201).json({
      success: true,
      message: 'Sanctuary booking confirmed successfully! Your official E-Permit is generated.',
      booking,
    });
  } catch (error) {
    console.error('[Create Booking Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get real-time Safari slot capacity & availability for UI display
// @route   GET /api/bookings/availability
exports.getSafariSlotAvailability = async (req, res) => {
  try {
    const { safari_id, date, shift = 'Morning' } = req.query;

    if (!safari_id || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide safari_id and date (YYYY-MM-DD)',
      });
    }

    const safari = await Safari.findById(safari_id);
    if (!safari) {
      return res.status(404).json({ success: false, message: 'Safari not found' });
    }

    const capacity = safari.max_seats || DEFAULT_SAFARI_CAPACITY || 6;
    const formattedDate = new Date(date).toISOString().split('T')[0];

    const slot = await SafariSlot.findOne({
      safari_id,
      date: formattedDate,
      shift,
    });

    const booked_seats = slot ? slot.booked_seats : 0;
    const remaining_seats = Math.max(0, capacity - booked_seats);

    res.status(200).json({
      success: true,
      data: {
        safari_id,
        date: formattedDate,
        shift,
        capacity,
        booked_seats,
        remaining_seats,
        is_sold_out: remaining_seats <= 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('user', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user', 'name email phone avatar');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking permit not found' });
    }

    // Check ownership or admin
    const bookingUserId = booking.user ? (booking.user._id || booking.user).toString() : null;
    if (bookingUserId && bookingUserId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking permit' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel user's own booking via Centralized Cancellation Service
// @route   PUT /api/bookings/:id/cancel
exports.cancelMyBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking permit not found' });
    }

    const { reason } = req.body;
    const updatedBooking = await processBookingCancellation({
      booking,
      user: req.user,
      reason: reason || 'Traveler schedule cancellation',
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Reserved slot capacity has been released.',
      data: updatedBooking,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Ranger Checkpost Verification & Gate Check-In (Admin / Ranger Only)
// @route   POST /api/bookings/check-in/:idOrTicket
exports.checkInBooking = async (req, res) => {
  try {
    const { idOrTicket } = req.params;

    let booking = null;
    if (mongoose.Types.ObjectId.isValid(idOrTicket)) {
      booking = await Booking.findById(idOrTicket).populate('user', 'name email phone');
    }
    if (!booking) {
      booking = await Booking.findOne({ ticket_number: idOrTicket.toUpperCase().trim() }).populate('user', 'name email phone');
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'No booking permit found matching this ticket or QR identifier.',
      });
    }

    // Validation: Check Booking Status
    if (booking.status === BOOKING_STATUSES.CANCELLED) {
      return res.status(400).json({
        success: false,
        message: `PERMIT REJECTED: Booking #${booking.ticket_number} is CANCELLED and invalid for entry.`,
        booking,
      });
    }

    // Idempotency: Check if already checked in
    if (booking.check_in_status === CHECK_IN_STATUSES.CHECKED_IN) {
      return res.status(200).json({
        success: true,
        alreadyCheckedIn: true,
        message: `Traveler already checked in at ${new Date(booking.checked_in_at).toLocaleTimeString('en-IN')}`,
        booking,
      });
    }

    // Mark as Checked In
    booking.check_in_status = CHECK_IN_STATUSES.CHECKED_IN;
    booking.checked_in_at = new Date();
    booking.checked_in_by = req.user._id;
    await booking.save();

    // Record Admin Audit Log
    await AdminLog.create({
      actor_id: req.user._id,
      actor_name: req.user.name,
      action: 'RANGER_GATE_CHECKIN',
      target_type: 'Booking',
      target_id: booking._id,
      details: `Ranger checked in permit #${booking.ticket_number} for ${booking.tourist_name} (${booking.item_name})`,
      ip_address: req.ip || '127.0.0.1',
    }).catch((e) => {});

    res.status(200).json({
      success: true,
      message: `GATE CLEARANCE APPROVED: #${booking.ticket_number} checked in for ${booking.tourist_name}!`,
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings (Admin with search & pagination)
// @route   GET /api/bookings/admin/all
exports.getAllBookings = async (req, res) => {
  try {
    const { status, item_type, search, page = 1, limit = 50 } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (item_type && item_type !== 'All') {
      query.item_type = item_type;
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { tourist_name: { $regex: escaped, $options: 'i' } },
        { item_name: { $regex: escaped, $options: 'i' } },
        { ticket_number: { $regex: escaped, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total: totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export Bookings to CSV (Admin only with formula injection sanitization)
// @route   GET /api/bookings/admin/export-csv
exports.exportBookingsCsv = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5000);

    const headers = [
      'Ticket Number',
      'Lead Traveler',
      'Traveler Email',
      'Traveler Phone',
      'Category',
      'Experience Name',
      'Shift / Timing',
      'Headcount',
      'Total Tariff (INR)',
      'Payment Mode',
      'Payment Status',
      'Booking Status',
      'Gate Check-In',
      'Booking Date',
      'Created At',
    ];

    const rows = bookings.map((b) => [
      sanitizeCsvField(b.ticket_number),
      sanitizeCsvField(b.tourist_name),
      sanitizeCsvField(b.tourist_email || b.user?.email || ''),
      sanitizeCsvField(b.tourist_phone || b.user?.phone || ''),
      sanitizeCsvField(b.item_type),
      sanitizeCsvField(b.item_name),
      sanitizeCsvField(b.safari_shift || 'N/A'),
      sanitizeCsvField(b.num_persons),
      sanitizeCsvField(b.total_price),
      sanitizeCsvField(b.payment_mode),
      sanitizeCsvField(b.payment_status),
      sanitizeCsvField(b.status),
      sanitizeCsvField(b.check_in_status || 'NOT_CHECKED_IN'),
      sanitizeCsvField(b.booking_date ? new Date(b.booking_date).toISOString().split('T')[0] : 'N/A'),
      sanitizeCsvField(new Date(b.createdAt).toISOString()),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=wildtour_sanctuary_permits_${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status (Admin)
// @route   PUT /api/bookings/admin/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, payment_status, check_in_status } = req.body;
    const booking = await Booking.findById(req.params.id).populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking permit not found' });
    }

    const previousStatus = booking.status;

    if (status) booking.status = status;
    if (payment_status) booking.payment_status = payment_status;
    if (check_in_status) booking.check_in_status = check_in_status;

    await booking.save();

    // Audit log
    await AdminLog.create({
      actor_id: req.user._id,
      actor_name: req.user.name,
      action: 'ADMIN_UPDATE_BOOKING_STATUS',
      target_type: 'Booking',
      target_id: booking._id,
      details: `Updated booking #${booking.ticket_number} status from ${previousStatus} to ${booking.status}`,
      ip_address: req.ip || '127.0.0.1',
    }).catch((e) => {});

    res.status(200).json({
      success: true,
      message: `Booking #${booking.ticket_number} status updated to ${booking.status}!`,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete booking (Admin)
// @route   DELETE /api/bookings/admin/:id
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await AdminLog.create({
      actor_id: req.user._id,
      actor_name: req.user.name,
      action: 'ADMIN_DELETE_BOOKING',
      target_type: 'Booking',
      target_id: booking._id,
      details: `Deleted booking record #${booking.ticket_number} (${booking.item_name})`,
      ip_address: req.ip || '127.0.0.1',
    }).catch((e) => {});

    res.status(200).json({ success: true, message: 'Booking deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Admin Dashboard Analytics & Graphs Data
// @route   GET /api/bookings/admin/analytics
exports.getAdminAnalyticsStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: { $ne: 'Cancelled' } });
    const confirmedBookings = await Booking.countDocuments({ status: { $in: ['Confirmed', 'Completed'] } });
    const pendingBookings = await Booking.countDocuments({ status: { $in: ['Pending', 'Booked'] } });
    const cancelledBookings = await Booking.countDocuments({ status: 'Cancelled' });

    const totalRevenueAgg = await Booking.aggregate([
      { $match: { payment_status: 'Paid', status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total_price' } } },
    ]);
    const totalRevenue = totalRevenueAgg.length > 0 ? totalRevenueAgg[0].total : 0;

    // Monthly bookings distribution (last 6 months)
    const monthlyBookings = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$payment_status', 'Paid'] }, '$total_price', 0],
            },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 },
    ]);

    // Daily bookings distribution (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailyBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$payment_status', 'Paid'] }, '$total_price', 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Bookings by Item Type
    const bookingsByType = await Booking.aggregate([
      { $group: { _id: '$item_type', count: { $sum: 1 }, revenue: { $sum: '$total_price' } } },
    ]);

    // Top Performing Safari / Items
    const topPerformingItems = await Booking.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: '$item_name',
          item_type: { $first: '$item_type' },
          item_image: { $first: '$item_image' },
          bookingsCount: { $sum: 1 },
          totalRevenue: { $sum: '$total_price' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
    ]);

    // Today's Safari Capacity Summary for quick ranger dashboard inspection
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySlots = await SafariSlot.find({ date: todayStr }).populate('safari_id', 'name');

    // Recent 10 Bookings with user details
    const recentBookings = await Booking.find()
      .populate('user', 'name email phone avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    const averageOrderValue = confirmedBookings > 0 ? Math.round(totalRevenue / confirmedBookings) : 0;

    const totalSafaris = await Safari.countDocuments();
    const totalStays = await Stay.countDocuments();
    const totalPackages = await Package.countDocuments();
    const totalGuides = await Guide.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        totalBookings,
        activeBookings,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        totalRevenue,
        averageOrderValue,
        totalSafaris,
        totalStays,
        totalPackages,
        totalGuides,
      },
      monthlyBookings,
      dailyBookings,
      bookingsByType,
      topPerformingItems,
      todaySlots,
      recentBookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get mathematically accurate booking performance analytics by range (7d, 30d, 6m)
// @route   GET /api/bookings/admin/performance
exports.getBookingPerformanceAnalytics = async (req, res) => {
  try {
    const range = (req.query.range || '30d').toLowerCase();
    const now = new Date();

    let startDate;
    let daysInRange;
    let groupingType = 'day';
    const bucketFormat = [];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    if (range === '7d') {
      daysInRange = 7;
      groupingType = 'day';
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);

      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const key = `${yyyy}-${mm}-${dd}`;
        const label = `${monthNames[d.getMonth()]} ${d.getDate()}`;
        const fullLabel = `${monthNames[d.getMonth()]} ${d.getDate()}, ${yyyy}`;

        bucketFormat.push({
          key,
          label,
          fullLabel,
          bookings: 0,
          revenue: 0,
          paidBookings: 0,
          cancelledBookings: 0,
        });
      }
    } else if (range === '6m') {
      groupingType = 'month';
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);
      daysInRange = Math.max(1, Math.round((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

      for (let i = 0; i < 6; i++) {
        const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const key = `${yyyy}-${mm}`;
        const label = monthNames[d.getMonth()];
        const fullLabel = `${fullMonthNames[d.getMonth()]} ${yyyy}`;

        bucketFormat.push({
          key,
          label,
          fullLabel,
          bookings: 0,
          revenue: 0,
          paidBookings: 0,
          cancelledBookings: 0,
        });
      }
    } else {
      daysInRange = 30;
      groupingType = 'day';
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);

      for (let i = 0; i < 30; i++) {
        const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const key = `${yyyy}-${mm}-${dd}`;
        const label = `${monthNames[d.getMonth()]} ${d.getDate()}`;
        const fullLabel = `${monthNames[d.getMonth()]} ${d.getDate()}, ${yyyy}`;

        bucketFormat.push({
          key,
          label,
          fullLabel,
          bookings: 0,
          revenue: 0,
          paidBookings: 0,
          cancelledBookings: 0,
        });
      }
    }

    const bookingsInRange = await Booking.find({
      createdAt: { $gte: startDate, $lte: now },
    });

    const bucketMap = new Map();
    bucketFormat.forEach((b) => bucketMap.set(b.key, { ...b }));

    let totalRevenue = 0;
    let paidBookingsCount = 0;
    let confirmedCount = 0;
    let pendingCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;

    bookingsInRange.forEach((b) => {
      const bDate = new Date(b.createdAt);
      let key;
      if (groupingType === 'month') {
        const yyyy = bDate.getFullYear();
        const mm = String(bDate.getMonth() + 1).padStart(2, '0');
        key = `${yyyy}-${mm}`;
      } else {
        const yyyy = bDate.getFullYear();
        const mm = String(bDate.getMonth() + 1).padStart(2, '0');
        const dd = String(bDate.getDate()).padStart(2, '0');
        key = `${yyyy}-${mm}-${dd}`;
      }

      const bucket = bucketMap.get(key);
      if (bucket) {
        bucket.bookings += 1;

        if (b.payment_status === 'Paid' && b.status !== 'Cancelled') {
          bucket.revenue += (b.total_price || 0);
          bucket.paidBookings += 1;
        }

        if (b.status === 'Cancelled') {
          bucket.cancelledBookings += 1;
        }
      }

      if (b.payment_status === 'Paid' && b.status !== 'Cancelled') {
        totalRevenue += (b.total_price || 0);
        paidBookingsCount += 1;
      }

      if (b.status === 'Confirmed') confirmedCount += 1;
      else if (b.status === 'Pending' || b.status === 'Booked') pendingCount += 1;
      else if (b.status === 'Completed') completedCount += 1;
      else if (b.status === 'Cancelled') cancelledCount += 1;
    });

    const chartData = bucketFormat.map((b) => bucketMap.get(b.key));
    const totalBookings = bookingsInRange.length;
    const velocityValue = Number((totalBookings / daysInRange).toFixed(2));
    const velocityFormatted = `${velocityValue} bookings/day`;

    let highestPeak = null;
    let maxBookingCount = 0;
    chartData.forEach((point) => {
      if (point.bookings > maxBookingCount) {
        maxBookingCount = point.bookings;
        highestPeak = {
          label: point.fullLabel || point.label,
          shortLabel: point.label,
          bookings: point.bookings,
          revenue: point.revenue,
        };
      }
    });

    if (!highestPeak || maxBookingCount === 0) {
      highestPeak = {
        label: 'No bookings in this period',
        shortLabel: 'None',
        bookings: 0,
        revenue: 0,
      };
    }

    const paymentFulfillmentPct = totalBookings > 0
      ? Math.round((paidBookingsCount / totalBookings) * 100)
      : 0;

    res.status(200).json({
      success: true,
      range,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      daysInRange,
      totalBookings,
      totalRevenue,
      averageOrderValue: paidBookingsCount > 0 ? Math.round(totalRevenue / paidBookingsCount) : 0,
      bookingVelocity: {
        value: velocityValue,
        formatted: velocityFormatted,
        days: daysInRange,
      },
      highestBookingPeak: highestPeak,
      paymentFulfillment: {
        percentage: paymentFulfillmentPct,
        paidBookings: paidBookingsCount,
        totalBookings,
        label: `${paidBookingsCount} of ${totalBookings} bookings paid`,
      },
      statusBreakdown: {
        confirmed: confirmedCount,
        pending: pendingCount,
        completed: completedCount,
        cancelled: cancelledCount,
        confirmedPct: totalBookings > 0 ? Math.round((confirmedCount / totalBookings) * 100) : 0,
        pendingPct: totalBookings > 0 ? Math.round((pendingCount / totalBookings) * 100) : 0,
        completedPct: totalBookings > 0 ? Math.round((completedCount / totalBookings) * 100) : 0,
        cancelledPct: totalBookings > 0 ? Math.round((cancelledCount / totalBookings) * 100) : 0,
      },
      chartData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
