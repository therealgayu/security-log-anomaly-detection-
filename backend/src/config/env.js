const dotenv = require('dotenv');

dotenv.config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/security_logs_db',
  jwtSecret: process.env.JWT_SECRET || 'temporary_dev_jwt_secret_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  corsOrigin: process.env.CORS_ORIGIN || process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  mlApiKey: process.env.ML_API_KEY || 'slads_ml_secret_key_2026',

  // Alert & Anomaly Thresholds
  alertDedupWindowMinutes: parseInt(process.env.ALERT_DEDUP_WINDOW_MINUTES, 10) || 30,
  alertThresholdCritical: parseFloat(process.env.ALERT_THRESHOLD_CRITICAL) || 0.88,
  alertThresholdHigh: parseFloat(process.env.ALERT_THRESHOLD_HIGH) || 0.75,
  alertThresholdMedium: parseFloat(process.env.ALERT_THRESHOLD_MEDIUM) || 0.60,

  // Inbound Webhook Secret
  inboundWebhookSecret: process.env.INBOUND_WEBHOOK_SECRET || 'slads_inbound_secret_2026'
};

module.exports = config;
