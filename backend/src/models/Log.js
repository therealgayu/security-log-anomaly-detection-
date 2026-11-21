const mongoose = require('mongoose');

// Placeholder schema for Security Logs (To be fully expanded in Phase 2)
const logSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    sourceIp: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    destinationIp: {
      type: String,
      trim: true
    },
    username: {
      type: String,
      trim: true,
      index: true
    },
    eventType: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'UNKNOWN'],
      default: 'UNKNOWN'
    },
    port: {
      type: Number
    },
    message: {
      type: String,
      trim: true
    },
    rawData: {
      type: String
    },
    isProcessed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
