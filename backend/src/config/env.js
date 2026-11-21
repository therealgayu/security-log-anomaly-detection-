const dotenv = require('dotenv');

dotenv.config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/security_logs_db',
  jwtSecret: process.env.JWT_SECRET || 'temporary_dev_jwt_secret_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  corsOrigin: process.env.CORS_ORIGIN || process.env.CLIENT_ORIGIN || 'http://localhost:3000'
};

module.exports = config;
