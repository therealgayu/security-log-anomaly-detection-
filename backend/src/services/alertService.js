const Alert = require('../models/Alert');
const config = require('../config/env');
const { dispatchAlertWebhooks } = require('./webhookService');

/**
 * Derives alert severity tier based on anomaly score thresholds
 */
const deriveSeverity = (anomalyScore) => {
  if (anomalyScore >= config.alertThresholdCritical) {
    return 'critical';
  }
  if (anomalyScore >= config.alertThresholdHigh) {
    return 'high';
  }
  if (anomalyScore >= config.alertThresholdMedium) {
    return 'medium';
  }
  return 'low';
};

/**
 * Generates descriptive reason for why the log is marked as an anomaly
 */
const deriveReason = (log, anomalyScore) => {
  const reasons = [];

  const hour = log.timestamp ? new Date(log.timestamp).getUTCHours() : new Date().getUTCHours();
  if (hour < 6 || hour >= 22) {
    reasons.push('Off-hours activity');
  }

  if (log.eventType === 'login_failed') {
    reasons.push('Authentication failure / brute-force suspicion');
  } else if (log.eventType === 'privilege_change') {
    reasons.push('Privilege escalation attempt');
  } else if (log.eventType === 'access_denied') {
    reasons.push('Restricted resource access breach');
  }

  if (log.statusCode >= 500) {
    reasons.push(`System fault response (HTTP ${log.statusCode})`);
  } else if (log.statusCode === 403 || log.statusCode === 401) {
    reasons.push(`Unauthorized response (HTTP ${log.statusCode})`);
  }

  if (reasons.length === 0) {
    reasons.push(`High statistical outlier score (${(anomalyScore * 100).toFixed(1)}%)`);
  }

  return `${reasons.join(' | ')} on resource '${log.resource || '/'}'`;
};

/**
 * Evaluates predictions, applies deduplication window, and generates Alert documents
 */
const processAnomaliesToAlerts = async (logs, predictions) => {
  const anomalies = predictions.filter((p) => p.isAnomaly === true);
  if (anomalies.length === 0) {
    return { alertsCreated: 0, deduplicatedCount: 0 };
  }

  const cutoffDate = new Date(Date.now() - config.alertDedupWindowMinutes * 60 * 1000);
  let createdCount = 0;
  let dedupCount = 0;

  for (const item of anomalies) {
    const log = logs[item.index];
    if (!log) continue;

    const severity = deriveSeverity(item.anomalyScore);
    const reason = deriveReason(log, item.anomalyScore);

    // Deduplication check: check if an active (non-resolved) alert exists
    // for this sourceIp within the deduplication window
    const existingAlert = await Alert.findOne({
      sourceIp: log.sourceIp,
      status: { $ne: 'resolved' },
      createdAt: { $gte: cutoffDate }
    });

    if (existingAlert) {
      dedupCount++;
      continue;
    }

    const newAlert = await Alert.create({
      logId: log._id,
      sourceIp: log.sourceIp,
      username: log.username,
      severity,
      status: 'open',
      reason,
      anomalyScore: item.anomalyScore,
      createdAt: new Date()
    });

    createdCount++;

    // Asynchronously dispatch webhook for high or critical severities
    if (['high', 'critical'].includes(severity)) {
      dispatchAlertWebhooks(newAlert, log).catch((err) => {
        console.error(`[Alert Service Error] Webhook delivery exception: ${err.message}`);
      });
    }
  }

  return { alertsCreated: createdCount, deduplicatedCount: dedupCount };
};

module.exports = {
  deriveSeverity,
  deriveReason,
  processAnomaliesToAlerts
};
