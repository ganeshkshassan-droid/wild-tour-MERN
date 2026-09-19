const Guide = require('../models/Guide');

// @desc    Get all active guides
// @route   GET /api/guides
exports.getGuides = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { active: true };

    if (search) {
      const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.name = { $regex: escaped, $options: 'i' };
    }

    const guides = await Guide.find(query).sort({ price: 1 });
    res.status(200).json({ success: true, count: guides.length, data: guides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all guides (admin)
// @route   GET /api/guides/admin/all
exports.getAdminGuides = async (req, res) => {
  try {
    const guides = await Guide.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: guides.length, data: guides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single guide
// @route   GET /api/guides/:id
exports.getGuideById = async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }
    res.status(200).json({ success: true, data: guide });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create guide (Admin)
// @route   POST /api/guides
exports.createGuide = async (req, res) => {
  try {
    const guide = await Guide.create(req.body);
    res.status(201).json({ success: true, message: 'Guide created successfully!', data: guide });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update guide (Admin)
// @route   PUT /api/guides/:id
exports.updateGuide = async (req, res) => {
  try {
    const guide = await Guide.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }
    res.status(200).json({ success: true, message: 'Guide updated successfully!', data: guide });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete guide (Admin)
// @route   DELETE /api/guides/:id
exports.deleteGuide = async (req, res) => {
  try {
    const guide = await Guide.findByIdAndDelete(req.params.id);
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }
    res.status(200).json({ success: true, message: 'Guide deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
