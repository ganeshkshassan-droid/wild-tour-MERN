const express = require('express');
const router = express.Router();
const {
  getGuides,
  getAdminGuides,
  getGuideById,
  createGuide,
  updateGuide,
  deleteGuide,
} = require('../controllers/guideController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getGuides);
router.get('/admin/all', protect, adminOnly, getAdminGuides);
router.get('/:id', getGuideById);

router.post('/', protect, adminOnly, createGuide);
router.put('/:id', protect, adminOnly, updateGuide);
router.delete('/:id', protect, adminOnly, deleteGuide);

module.exports = router;
