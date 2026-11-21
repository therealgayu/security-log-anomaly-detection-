const crypto = require('crypto');
const axios = require('axios');
const Webhook = require('../models/Webhook');

/**
 * Computes HMAC-SHA256 signature for payload verification
 */
const computeHmacSignature = (secret, payloadString) => {
  return crypto
    .createHmac('sha256', secret)
    .update(payloadString, 'utf-8')
    .digest('hex');
};

/**
 * Builds formatted payload based on webhook destination format (standard, slack, discord)
 */
const buildPayload = (format, alert, log) => {
  const eventName = `alert.${alert.severity}`;

  if (format === 'slack') {
    const color = alert.severity === 'critical' ? '#FF0000' : alert.severity === 'high' ? '#FF8C00' : '#FFD700';
    return {
      text: `🚨 *[SLADS Alert]* ${alert.severity.toUpperCase()}: ${alert.reason}`,
      attachments: [
        {
          color,
          title: `Security Anomaly Detected - ${alert.severity.toUpperCase()}`,
          fields: [
            { title: 'Source IP', value: alert.sourceIp, short: true },
            { title: 'Username', value: alert.username, short: true },
            { title: 'Anomaly Score', value: `${(alert.anomalyScore * 100).toFixed(1)}%`, short: true },
            { title: 'Status', value: alert.status.toUpperCase(), short: true },
            { title: 'Reason', value: alert.reason, short: false },
            { title: 'Timestamp', value: new Date(alert.createdAt).toISOString(), short: false }
          ],
          footer: 'NIIT University Security Log Anomaly Detection System',
          ts: Math.floor(new Date(alert.createdAt).getTime() / 1000)
        }
      ]
    };
  }

  if (format === 'discord') {
    const color = alert.severity === 'critical' ? 16711680 : alert.severity === 'high' ? 16744192 : 16766720;
    return {
      embeds: [
        {
          title: `🚨 SLADS Security Alert: ${alert.severity.toUpperCase()}`,
          description: alert.reason,
          color,
          fields: [
            { name: 'Source IP', value: alert.sourceIp, inline: true },
            { name: 'Username', value: alert.username, inline: true },
            { name: 'Anomaly Score', value: `${(alert.anomalyScore * 100).toFixed(1)}%`, inline: true },
            { name: 'Status', value: alert.status.toUpperCase(), inline: true }
          ],
          timestamp: new Date(alert.createdAt).toISOString(),
          footer: { text: 'Security Log Anomaly Detection System' }
        }
      ]
    };
  }

  // Standard JSON payload
  return {
    event: eventName,
    timestamp: new Date().toISOString(),
    alert: {
      id: alert._id,
      severity: alert.severity,
      reason: alert.reason,
      anomalyScore: alert.anomalyScore,
      sourceIp: alert.sourceIp,
      username: alert.username,
      status: alert.status,
      createdAt: alert.createdAt
    },
    log: log
      ? {
          id: log._id,
          timestamp: log.timestamp,
          eventType: log.eventType,
          statusCode: log.statusCode,
          resource: log.resource
        }
      : null
  };
};

/**
 * Sends webhook payload with up to 3 retries and exponential backoff
 */
const deliverWebhookWithRetry = async (webhook, payload, maxRetries = 3) => {
  const payloadString = JSON.stringify(payload);
  const signature = computeHmacSignature(webhook.secret, payloadString);

  const startTime = Date.now();
  let attempt = 0;
  let lastError = null;
  let statusCode = 0;

  const delays = [0, 500, 1500];

  while (attempt < maxRetries) {
    if (delays[attempt] > 0) {
      await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
    }

    attempt++;
    try {
      const response = await axios.post(webhook.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': `sha256=${signature}`,
          'X-Event': `alert.${payload.alert ? payload.alert.severity : 'notification'}`,
          'User-Agent': 'SLADS-Webhook-Dispatcher/1.0'
        },
        timeout: 8000
      });

      statusCode = response.status;
      const durationMs = Date.now() - startTime;

      // Record successful delivery (keep last 50 logs)
      await Webhook.findByIdAndUpdate(webhook._id, {
        $push: {
          deliveryLogs: {
            $each: [
              {
                timestamp: new Date(),
                event: `alert.${payload.alert ? payload.alert.severity : 'notification'}`,
                status: 'success',
                statusCode,
                attempts: attempt,
                error: null,
                durationMs
              }
            ],
            $slice: -50
          }
        }
      });

      return { success: true, attempts: attempt, statusCode };
    } catch (err) {
      lastError = err.message;
      statusCode = err.response ? err.response.status : 0;
    }
  }

  const durationMs = Date.now() - startTime;

  // Record failed delivery
  await Webhook.findByIdAndUpdate(webhook._id, {
    $push: {
      deliveryLogs: {
        $each: [
          {
            timestamp: new Date(),
            event: `alert.${payload.alert ? payload.alert.severity : 'notification'}`,
            status: 'failed',
            statusCode,
            attempts: attempt,
            error: lastError,
            durationMs
          }
        ],
        $slice: -50
      }
    }
  });

  return { success: false, attempts: attempt, error: lastError, statusCode };
};

/**
 * Dispatches alerts with high or critical severity to active webhooks
 */
const dispatchAlertWebhooks = async (alert, log = null) => {
  if (!alert || !['high', 'critical'].includes(alert.severity)) {
    return;
  }

  try {
    const targetEvent = `alert.${alert.severity}`;
    const webhooks = await Webhook.find({
      active: true,
      events: { $in: [targetEvent, '*', 'alert.*'] }
    });

    if (!webhooks || webhooks.length === 0) {
      return;
    }

    const dispatches = webhooks.map((webhook) => {
      const payload = buildPayload(webhook.format, alert, log);
      return deliverWebhookWithRetry(webhook, payload);
    });

    await Promise.allSettled(dispatches);
  } catch (error) {
    console.error(`[Webhook Dispatch Error] Failed to dispatch alerts: ${error.message}`);
  }
};

module.exports = {
  computeHmacSignature,
  buildPayload,
  deliverWebhookWithRetry,
  dispatchAlertWebhooks
};
