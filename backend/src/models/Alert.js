const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    logId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Log',
      required: [true, 'Log reference is required'],
      index: true
    },
    sourceIp: {
      type: String,
      required: [true, 'Source IP is required'],
      trim: true,
      index: true
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      index: true
    },
    severity: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: '{VALUE} is not a valid severity level'
      },
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'acknowledged', 'resolved'],
        message: '{VALUE} is not a valid alert status'
      },
      default: 'open',
      index: true
    },
    reason: {
      type: String,
      required: [true, 'Alert reason is required'],
      trim: true
    },
    anomalyScore: {
      type: Number,
      required: true,
      min: 0.0,
      max: 1.0,
      index: true
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for dashboard queries and alert triage
alertSchema.index({ status: 1, severity: 1, createdAt: -1 });
alertSchema.index({ sourceIp: 1, createdAt: -1 });
alertSchema.index({ username: 1, status: 1 });

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
