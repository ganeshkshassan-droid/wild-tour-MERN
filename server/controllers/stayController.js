const Stay = require('../models/Stay');

// @desc    Get all active stays
// @route   GET /api/stays
exports.getStays = async (req, res) => {
  try {
    const { search, maxPrice } = req.query;
    let query = { active: true };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (maxPrice) {
      query.price_per_night = { $lte: Number(maxPrice) };
    }

    const stays = await Stay.find(query).sort({ price_per_night: 1 });
    res.status(200).json({ success: true, count: stays.length, data: stays });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all stays (admin)
// @route   GET /api/stays/admin/all
exports.getAdminStays = async (req, res) => {
  try {
    const stays = await Stay.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: stays.length, data: stays });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single stay
// @route   GET /api/stays/:id
exports.getStayById = async (req, res) => {
  try {
    const stay = await Stay.findById(req.params.id);
    if (!stay) {
      return res.status(404).json({ success: false, message: 'Stay not found' });
    }
    res.status(200).json({ success: true, data: stay });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create stay (Admin)
// @route   POST /api/stays
exports.createStay = async (req, res) => {
  try {
    const stay = await Stay.create(req.body);
    res.status(201).json({ success: true, message: 'Resort stay created successfully!', data: stay });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update stay (Admin)
// @route   PUT /api/stays/:id
exports.updateStay = async (req, res) => {
  try {
    const stay = await Stay.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!stay) {
      return res.status(404).json({ success: false, message: 'Stay not found' });
    }
    res.status(200).json({ success: true, message: 'Resort stay updated successfully!', data: stay });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete stay (Admin)
// @route   DELETE /api/stays/:id
exports.deleteStay = async (req, res) => {
  try {
    const stay = await Stay.findByIdAndDelete(req.params.id);
    if (!stay) {
      return res.status(404).json({ success: false, message: 'Stay not found' });
    }
    res.status(200).json({ success: true, message: 'Resort stay deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
