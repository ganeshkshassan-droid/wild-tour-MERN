const Safari = require('../models/Safari');

// @desc    Get all active safaris (with optional search/category filter)
// @route   GET /api/safaris
exports.getSafaris = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { active: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.name = { $regex: escaped, $options: 'i' };
    }

    const safaris = await Safari.find(query).sort({ price_per_seat: 1 });
    res.status(200).json({ success: true, count: safaris.length, data: safaris });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all safaris (for admin, including inactive)
// @route   GET /api/safaris/admin/all
exports.getAdminSafaris = async (req, res) => {
  try {
    const safaris = await Safari.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: safaris.length, data: safaris });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single safari by ID
// @route   GET /api/safaris/:id
exports.getSafariById = async (req, res) => {
  try {
    const safari = await Safari.findById(req.params.id);
    if (!safari) {
      return res.status(404).json({ success: false, message: 'Safari not found' });
    }
    res.status(200).json({ success: true, data: safari });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new safari (Admin)
// @route   POST /api/safaris
exports.createSafari = async (req, res) => {
  try {
    const safari = await Safari.create(req.body);
    res.status(201).json({ success: true, message: 'Safari created successfully!', data: safari });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update safari (Admin)
// @route   PUT /api/safaris/:id
exports.updateSafari = async (req, res) => {
  try {
    const safari = await Safari.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!safari) {
      return res.status(404).json({ success: false, message: 'Safari not found' });
    }
    res.status(200).json({ success: true, message: 'Safari updated successfully!', data: safari });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete safari (Admin)
// @route   DELETE /api/safaris/:id
exports.deleteSafari = async (req, res) => {
  try {
    const safari = await Safari.findByIdAndDelete(req.params.id);
    if (!safari) {
      return res.status(404).json({ success: false, message: 'Safari not found' });
    }
    res.status(200).json({ success: true, message: 'Safari deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
