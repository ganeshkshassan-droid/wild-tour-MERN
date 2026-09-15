const express = require('express');
const router = express.Router();
const {
  getPackages,
  getAdminPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
} = require('../controllers/packageController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getPackages);
router.get('/admin/all', protect, adminOnly, getAdminPackages);
router.get('/:id', getPackageById);

router.post('/', protect, adminOnly, createPackage);
router.put('/:id', protect, adminOnly, updatePackage);
router.delete('/:id', protect, adminOnly, deletePackage);

module.exports = router;
