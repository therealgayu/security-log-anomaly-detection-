const mongoose = require('mongoose');
const Webhook = require('../models/Webhook');
const Log = require('../models/Log');
const AppError = require('../utils/AppError');
const config = require('../config/env');
const { preprocessBatch } = require('../services/logPreprocessorService');
const { deliverWebhookWithRetry } = require('../services/webhookService');

/**
 * POST /api/webhooks
 * Admin: Register a new outbound webhook destination
 */
const createWebhook = async (req, res, next) => {
  
  try {
    const { url, secret, events, format, active } = req.body;

        if (!url || !secret) {
      return next(new AppError('Both url and secret are required to register a webhook', 400));
    }

    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('bad protocol');
    } catch {
      return next(new AppError('A valid http(s) URL is required', 400));
    }

    const webhook = await Webhook.create({
      url,
      secret,
      events: Array.isArray(events) && events.length > 0 ? events : ['alert.critical', 'alert.high'],
      format: ['standard', 'slack', 'discord'].includes(format) ? format : 'standard',
      active: active !== undefined ? active : true,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Webhook endpoint registered successfully',
      data: {
        webhook
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/webhooks
 * Admin: List all registered webhooks and their delivery logs
 */
const getWebhooks = async (req, res, next) => {
  try {
    const webhooks = await Webhook.find({})
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        webhooks
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/webhooks/:id
 * Admin: Remove a registered webhook
 */
const deleteWebhook = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid webhook ID format', 400));
    }

    const deleted = await Webhook.findByIdAndDelete(id);
    if (!deleted) {
      return next(new AppError('Webhook not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Webhook deleted successfully',
      data: {
        deletedId: id
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/webhooks/:id/test
 * Admin: Send a test ping to verify webhook connectivity
 */
const testWebhook = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid webhook ID format', 400));
    }

    const webhook = await Webhook.findById(id);
    if (!webhook) {
      return next(new AppError('Webhook not found', 404));
    }

    const testPayload = {
      event: 'test.ping',
      timestamp: new Date().toISOString(),
      alert: {
        id: new mongoose.Types.ObjectId(),
        severity: 'critical',
        reason: 'Test webhook notification from SLADS',
        anomalyScore: 0.95,
        sourceIp: '198.51.100.44',
        username: 'test.analyst',
        status: 'open',
        createdAt: new Date().toISOString()
      }
    };

    const deliveryResult = await deliverWebhookWithRetry(webhook, testPayload, 1);

    res.status(200).json({
      success: true,
      message: deliveryResult.success
        ? 'Test webhook delivered successfully'
        : `Webhook delivery failed: ${deliveryResult.error}`,
      data: deliveryResult
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/webhooks/inbound/logs
 * Inbound webhook for external log shippers, authenticated by shared secret header
 */
const handleInboundLogs = async (req, res, next) => {
  try {
    const providedSecret =
      req.headers['x-webhook-secret'] ||
      (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));

    if (!providedSecret || providedSecret !== config.inboundWebhookSecret) {
      return next(new AppError('Unauthorized: Invalid or missing inbound webhook secret', 401));
    }

    const rawData = Array.isArray(req.body) ? req.body : req.body.logs ? req.body.logs : [req.body];

    if (!Array.isArray(rawData) || rawData.length === 0) {
      return next(new AppError('Inbound payload must contain one or more log objects', 400));
    }

    const { accepted, rejected, totalReceived, acceptedCount, rejectedCount } = preprocessBatch(rawData);

    let insertedCount = 0;
    if (accepted.length > 0) {
      const inserted = await Log.insertMany(accepted, { ordered: false });
      insertedCount = inserted.length;
    }

    res.status(201).json({
      success: true,
      message: `Inbound logs processed: ${insertedCount} accepted, ${rejectedCount} rejected.`,
      data: {
        totalReceived,
        acceptedCount: insertedCount,
        rejectedCount,
        rejections: rejected.slice(0, 50)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWebhook,
  getWebhooks,
  deleteWebhook,
  testWebhook,
  handleInboundLogs
};
