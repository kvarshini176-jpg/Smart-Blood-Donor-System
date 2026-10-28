const createApp = require('./app');
const config = require('./config');

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`Smart Blood Donor System Backend API running on port ${config.port}`);
  console.log(`Health Check: http://localhost:${config.port}/api/health`);
  console.log(`Mode: ${config.nodeEnv}`);
  console.log(`====================================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = server;
