const Package = require('../models/Package');

// @desc    Get all active packages
// @route   GET /api/packages
exports.getPackages = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { active: true };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const packages = await Package.find(query).sort({ price: -1 });
    res.status(200).json({ success: true, count: packages.length, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all packages (admin)
// @route   GET /api/packages/admin/all
exports.getAdminPackages = async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: packages.length, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single package
// @route   GET /api/packages/:id
exports.getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.status(200).json({ success: true, data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create package (Admin)
// @route   POST /api/packages
exports.createPackage = async (req, res) => {
  try {
    const pkg = await Package.create(req.body);
    res.status(201).json({ success: true, message: 'Tour package created successfully!', data: pkg });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update package (Admin)
// @route   PUT /api/packages/:id
exports.updatePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.status(200).json({ success: true, message: 'Tour package updated successfully!', data: pkg });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete package (Admin)
// @route   DELETE /api/packages/:id
exports.deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.status(200).json({ success: true, message: 'Tour package deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
