const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema(
  {
    actor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actor_name: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    target_type: {
      type: String,
      enum: ['Safari', 'Stay', 'Package', 'Guide', 'Booking', 'User', 'System'],
      default: 'System',
    },
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    details: {
      type: String,
      required: true,
    },
    ip_address: {
      type: String,
      default: '127.0.0.1',
    },
  },
  {
    timestamps: true,
    // Audit logs are append-only; disallow casual deletion
  }
);

adminLogSchema.index({ createdAt: -1 });
adminLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AdminLog', adminLogSchema);
