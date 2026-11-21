const mongoose = require('mongoose');

const deliveryLogSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now
    },
    event: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      required: true
    },
    statusCode: {
      type: Number,
      default: 0
    },
    attempts: {
      type: Number,
      default: 1
    },
    error: {
      type: String,
      default: null
    },
    durationMs: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const webhookSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'Webhook destination URL is required'],
      trim: true
    },
    secret: {
      type: String,
      required: [true, 'Webhook signing secret is required'],
      trim: true
    },
    events: {
      type: [String],
      default: ['alert.critical', 'alert.high'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one subscribed event is required'
      }
    },
    active: {
      type: Boolean,
      default: true,
      index: true
    },
    format: {
      type: String,
      enum: ['standard', 'slack', 'discord'],
      default: 'standard'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    deliveryLogs: {
      type: [deliveryLogSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

webhookSchema.index({ active: 1 });

const Webhook = mongoose.model('Webhook', webhookSchema);

module.exports = Webhook;
