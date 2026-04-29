const app = require('./app');
const ensureDemoAccounts = require('./bootstrap/ensureDemoAccounts');
const connectDatabase = require('./config/db');
const env = require('./config/env');

const startServer = async () => {
  try {
    console.log('NODE_ENV:', env.nodeEnv);
    console.log('PORT:', env.port);
    console.log('MONGO_URI starts:', env.mongoUri?.startsWith('mongodb'));

    await connectDatabase();

    await ensureDemoAccounts({
      enabled: false,
      nodeEnv: env.nodeEnv,
    });

    app.listen(env.port, '0.0.0.0', () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

startServer();