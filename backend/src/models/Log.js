const mongoose = require('mongoose');

const VALID_EVENT_TYPES = [
  'login_success',
  'login_failed',
  'access_denied',
  'file_access',
  'privilege_change',
  'system_error'
];

const logSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      required: [true, 'Log timestamp is required'],
      index: true
    },
    sourceIp: {
      type: String,
      required: [true, 'Source IP address is required'],
      trim: true,
      index: true
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      index: true
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: {
        values: VALID_EVENT_TYPES,
        message: '{VALUE} is not a valid eventType'
      },
      index: true
    },
    resource: {
      type: String,
      trim: true,
      default: ''
    },
    statusCode: {
      type: Number,
      default: 200
    },
    userAgent: {
      type: String,
      trim: true,
      default: ''
    },
    message: {
      type: String,
      trim: true,
      default: ''
    },
    raw: {
      type: String,
      default: ''
    },
    anomalyScore: {
      type: Number,
      default: null
    },
    isAnomaly: {
      type: Boolean,
      default: false,
      index: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for optimized querying and aggregation
logSchema.index({ timestamp: -1, isAnomaly: 1 });
logSchema.index({ sourceIp: 1, eventType: 1 });
logSchema.index({ username: 1, timestamp: -1 });

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
module.exports.VALID_EVENT_TYPES = VALID_EVENT_TYPES;
