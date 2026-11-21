const mongoose = require('mongoose');

// Placeholder schema for Security Alerts (To be fully expanded in Phase 4)
const alertSchema = new mongoose.Schema(
  {
    logId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Log'
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium'
    },
    anomalyScore: {
      type: Number,
      default: 0.0
    },
    status: {
      type: String,
      enum: ['open', 'acknowledged', 'resolved'],
      default: 'open'
    },
    detectedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
