const express = require('express');
const router = express.Router();
const {
  getSafaris,
  getAdminSafaris,
  getSafariById,
  createSafari,
  updateSafari,
  deleteSafari,
} = require('../controllers/safariController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getSafaris);
router.get('/admin/all', protect, adminOnly, getAdminSafaris);
router.get('/:id', getSafariById);

router.post('/', protect, adminOnly, createSafari);
router.put('/:id', protect, adminOnly, updateSafari);
router.delete('/:id', protect, adminOnly, deleteSafari);

module.exports = router;
