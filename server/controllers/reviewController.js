const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @desc    Get verified reviews for an inventory item
// @route   GET /api/reviews/item/:itemId
exports.getItemReviews = async (req, res) => {
  try {
    const { itemId } = req.params;
    const reviews = await Review.find({ item_id: itemId })
      .populate('user', 'name avatar address')
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
      : 5.0;

    res.status(200).json({
      success: true,
      count: totalReviews,
      averageRating,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a verified review for a completed expedition
// @route   POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { booking_id, item_id, item_type, rating, comment } = req.body;

    if (!booking_id || !item_id || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide booking ID, item identifier, star rating, and review text',
      });
    }

    // 1. Verify Booking Validity & Ownership
    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Valid booking permit record required to leave a review' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only review experiences you personally booked' });
    }

    // 2. Verify Booking Status (Must be Completed or Confirmed with past trip date)
    const tripDate = new Date(booking.booking_date || booking.to_date || booking.createdAt);
    const isPast = tripDate.getTime() < Date.now();

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Cancelled reservations are not eligible for reviews' });
    }

    if (booking.status !== 'Completed' && !isPast) {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted after completing your sanctuary expedition',
      });
    }

    // 3. Verify Item Match
    if (booking.item_id && booking.item_id.toString() !== item_id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'The reviewed experience does not match the item on this booking permit',
      });
    }

    // 4. Duplicate Check
    const existingReview = await Review.findOne({ user: req.user._id, booking: booking._id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a verified review for this expedition',
      });
    }

    const review = await Review.create({
      user: req.user._id,
      booking: booking._id,
      item_id,
      item_type: item_type || booking.item_type,
      rating: Number(rating),
      comment: comment.trim(),
      traveler_name: req.user.name,
      traveler_avatar: req.user.avatar || '',
      verified_expedition: true,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your verified wildlife review has been published.',
      data: review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A review has already been recorded for this booking permit',
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
