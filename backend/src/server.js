const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');

const startServer = async () => {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`[SLADS Server] Running in ${config.nodeEnv} mode on port ${config.port}`);
    console.log(`[SLADS Server] Health check available at: http://localhost:${config.port}/api/health`);
  });

  const shutdown = (signal) => {
    console.log(`[SLADS Server] Received ${signal}. Initiating graceful shutdown...`);
    server.close(() => {
      console.log('[SLADS Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();
