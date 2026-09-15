const express = require('express');
const router = express.Router();
const {
  createBooking,
  getSafariSlotAvailability,
  getMyBookings,
  getBookingById,
  cancelMyBooking,
  checkInBooking,
  getAllBookings,
  exportBookingsCsv,
  updateBookingStatus,
  deleteBooking,
  getAdminAnalyticsStats,
  getBookingPerformanceAnalytics,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

// Public / Traveler Availability Route (For UI Capacity Display)
router.get('/availability', getSafariSlotAvailability);

// Traveler routes
router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelMyBooking);

// Ranger / Admin Gate Operations
router.post('/check-in/:idOrTicket', protect, adminOnly, checkInBooking);

// Admin routes
router.get('/admin/analytics', protect, adminOnly, getAdminAnalyticsStats);
router.get('/admin/performance', protect, adminOnly, getBookingPerformanceAnalytics);
router.get('/admin/export-csv', protect, adminOnly, exportBookingsCsv);
router.get('/admin/all', protect, adminOnly, getAllBookings);
router.put('/admin/:id/status', protect, adminOnly, updateBookingStatus);
router.delete('/admin/:id', protect, adminOnly, deleteBooking);

module.exports = router;

