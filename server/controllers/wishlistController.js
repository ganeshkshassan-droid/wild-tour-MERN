const Wishlist = require('../models/Wishlist');
const Safari = require('../models/Safari');
const Stay = require('../models/Stay');
const Package = require('../models/Package');
const Guide = require('../models/Guide');

// Helper to get model by type
const getModelByType = (type) => {
  switch (type) {
    case 'Safari':
      return Safari;
    case 'Stay':
      return Stay;
    case 'Package':
      return Package;
    case 'Guide':
      return Guide;
    default:
      return null;
  }
};

// @desc    Get user's complete wishlist with populated item details
// @route   GET /api/wishlist
exports.getWishlist = async (req, res) => {
  try {
    const wishlistDocs = await Wishlist.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Populate each item from its respective collection
    const populatedItems = await Promise.all(
      wishlistDocs.map(async (w) => {
        const Model = getModelByType(w.item_type);
        if (!Model) return null;

        const itemData = await Model.findById(w.item_id);
        if (!itemData) return null; // Item was deleted

        return {
          _id: w._id,
          item_id: w.item_id,
          item_type: w.item_type,
          createdAt: w.createdAt,
          item: itemData,
        };
      })
    );

    // Filter out any null entries (deleted items)
    const validItems = populatedItems.filter(Boolean);

    res.status(200).json({
      success: true,
      count: validItems.length,
      data: validItems,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add item to wishlist
// @route   POST /api/wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { item_id, item_type } = req.body;

    if (!item_id || !item_type) {
      return res.status(400).json({ success: false, message: 'Item ID and item type are required' });
    }

    const Model = getModelByType(item_type);
    if (!Model) {
      return res.status(400).json({ success: false, message: `Invalid item type: ${item_type}` });
    }

    // Verify item existence
    const existingItem = await Model.findById(item_id);
    if (!existingItem) {
      return res.status(404).json({ success: false, message: 'Experience item not found' });
    }

    // Check if already in wishlist
    let wishlistItem = await Wishlist.findOne({ user: req.user._id, item_id });
    if (wishlistItem) {
      return res.status(200).json({
        success: true,
        message: 'Item is already in your saved experiences',
        data: wishlistItem,
      });
    }

    wishlistItem = await Wishlist.create({
      user: req.user._id,
      item_id,
      item_type,
    });

    res.status(201).json({
      success: true,
      message: 'Saved to your experiences wishlist!',
      data: wishlistItem,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:itemId
exports.removeFromWishlist = async (req, res) => {
  try {
    const { itemId } = req.params;

    // Delete by item_id or wishlist _id
    const deleted = await Wishlist.findOneAndDelete({
      user: req.user._id,
      $or: [{ item_id: itemId }, { _id: itemId }],
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Saved item not found in wishlist' });
    }

    res.status(200).json({
      success: true,
      message: 'Removed from Saved Experiences',
      deletedItemId: deleted.item_id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle item in wishlist (convenience endpoint)
// @route   POST /api/wishlist/toggle
exports.toggleWishlist = async (req, res) => {
  try {
    const { item_id, item_type } = req.body;

    if (!item_id || !item_type) {
      return res.status(400).json({ success: false, message: 'Item ID and item type are required' });
    }

    const existing = await Wishlist.findOne({ user: req.user._id, item_id });
    if (existing) {
      await Wishlist.findByIdAndDelete(existing._id);
      return res.status(200).json({
        success: true,
        isSaved: false,
        message: 'Removed from Saved Experiences',
        item_id,
      });
    }

    const Model = getModelByType(item_type);
    if (!Model) {
      return res.status(400).json({ success: false, message: `Invalid item type: ${item_type}` });
    }

    const itemExists = await Model.findById(item_id);
    if (!itemExists) {
      return res.status(404).json({ success: false, message: 'Experience item not found' });
    }

    const created = await Wishlist.create({
      user: req.user._id,
      item_id,
      item_type,
    });

    res.status(201).json({
      success: true,
      isSaved: true,
      message: 'Saved to your experiences wishlist!',
      data: created,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
