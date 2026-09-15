const express = require('express');
const router = express.Router();
const {
  getStays,
  getAdminStays,
  getStayById,
  createStay,
  updateStay,
  deleteStay,
} = require('../controllers/stayController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getStays);
router.get('/admin/all', protect, adminOnly, getAdminStays);
router.get('/:id', getStayById);

router.post('/', protect, adminOnly, createStay);
router.put('/:id', protect, adminOnly, updateStay);
router.delete('/:id', protect, adminOnly, deleteStay);

module.exports = router;
