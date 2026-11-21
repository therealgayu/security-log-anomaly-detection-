const Log = require('../models/Log');
const mlClient = require('../services/mlClient');
const alertService = require('../services/alertService');
const AppError = require('../utils/AppError');

/**
 * POST /api/ml/train
 * Admin only: Triggers Isolation Forest model training using stored logs from MongoDB
 */
const train = async (req, res, next) => {
  try {
    const limit = Math.min(25000, Math.max(10, parseInt(req.body.limit || req.query.limit, 10) || 5000));
    const contamination = req.body.contamination ? parseFloat(req.body.contamination) : null;

    const logs = await Log.find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    if (!logs || logs.length < 10) {
      return next(
        new AppError(
          `Insufficient logs in database to train model (found ${logs ? logs.length : 0}, minimum required: 10). Ingest or upload logs first.`,
          400
        )
      );
    }

    const formattedLogs = logs.map((l) => ({
      timestamp: l.timestamp ? l.timestamp.toISOString() : new Date().toISOString(),
      sourceIp: l.sourceIp,
      username: l.username,
      eventType: l.eventType,
      statusCode: l.statusCode || 200,
      resource: l.resource || '',
      userAgent: l.userAgent || '',
      message: l.message || ''
    }));

    const result = await mlClient.trainModel(formattedLogs, contamination);

    res.status(200).json({
      success: true,
      message: 'Machine Learning model trained and updated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ml/detect
 * Analyst / Admin: Evaluates stored logs, generates anomaly scores, updates MongoDB,
 * and creates prioritized alerts for detected anomalies.
 */
const detect = async (req, res, next) => {
  try {
    const limit = Math.min(10000, Math.max(1, parseInt(req.body.limit || req.query.limit, 10) || 1000));
    const unprocessedOnly = req.body.unprocessedOnly === true || req.query.unprocessedOnly === 'true';

    const query = {};
    if (unprocessedOnly) {
      query.anomalyScore = null;
    }

    const logs = await Log.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    if (!logs || logs.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No matching logs found for anomaly detection evaluation',
        data: {
          totalEvaluated: 0,
          anomaliesDetected: 0,
          updatedCount: 0,
          alertsCreated: 0,
          deduplicatedCount: 0
        }
      });
    }

    const formattedLogs = logs.map((l) => ({
      timestamp: l.timestamp ? l.timestamp.toISOString() : new Date().toISOString(),
      sourceIp: l.sourceIp,
      username: l.username,
      eventType: l.eventType,
      statusCode: l.statusCode || 200,
      resource: l.resource || '',
      userAgent: l.userAgent || '',
      message: l.message || ''
    }));

    const inferenceResult = await mlClient.predictLogs(formattedLogs);

    // 1. Bulk update logs in MongoDB with anomaly scores and flags
    const bulkOps = inferenceResult.predictions.map((p) => {
      const originalLog = logs[p.index];
      return {
        updateOne: {
          filter: { _id: originalLog._id },
          update: {
            $set: {
              anomalyScore: p.anomalyScore,
              isAnomaly: p.isAnomaly
            }
          }
        }
      };
    });

    if (bulkOps.length > 0) {
      await Log.bulkWrite(bulkOps);
    }

    // 2. Generate security alerts with deduplication and dispatch webhooks
    const alertResult = await alertService.processAnomaliesToAlerts(logs, inferenceResult.predictions);

    res.status(200).json({
      success: true,
      message: `Anomaly detection evaluation completed. Scored ${inferenceResult.total} logs, generated ${alertResult.alertsCreated} alerts.`,
      data: {
        totalEvaluated: inferenceResult.total,
        anomaliesDetected: inferenceResult.anomaliesDetected,
        updatedCount: bulkOps.length,
        alertsCreated: alertResult.alertsCreated,
        deduplicatedCount: alertResult.deduplicatedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ml/info
 */
const getModelInfo = async (req, res, next) => {
  try {
    const info = await mlClient.getModelInfo();
    res.status(200).json({
      success: true,
      data: info
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ml/health
 */
const getHealth = async (req, res, next) => {
  try {
    const health = await mlClient.checkHealth();
    res.status(200).json({
      success: true,
      data: health
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  train,
  detect,
  getModelInfo,
  getHealth
};
