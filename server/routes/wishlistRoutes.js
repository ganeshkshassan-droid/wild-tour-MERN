const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
} = require('../controllers/wishlistController');

router.use(protect); // All wishlist operations require authentication

router.route('/')
  .get(getWishlist)
  .post(addToWishlist);

router.post('/toggle', toggleWishlist);
router.delete('/:itemId', removeFromWishlist);

module.exports = router;
