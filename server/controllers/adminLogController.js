const AdminLog = require('../models/AdminLog');

// @desc    Get admin audit logs with pagination & filtering
// @route   GET /api/admin/audit
exports.getAuditLogs = async (req, res) => {
  try {
    const { action, target_type, page = 1, limit = 50 } = req.query;
    let query = {};

    if (action && action !== 'All') {
      query.action = action;
    }
    if (target_type && target_type !== 'All') {
      query.target_type = target_type;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await AdminLog.countDocuments(query);
    const logs = await AdminLog.find(query)
      .populate('actor_id', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: logs.length,
      total: totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
