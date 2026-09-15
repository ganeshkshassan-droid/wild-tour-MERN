const express = require('express');
const router = express.Router();
const { getItemReviews, createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/item/:itemId', getItemReviews);
router.post('/', protect, createReview);

module.exports = router;
