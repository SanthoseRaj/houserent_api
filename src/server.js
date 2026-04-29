const app = require('./app');
const ensureDemoAccounts = require('./bootstrap/ensureDemoAccounts');
const connectDatabase = require('./config/db');
const env = require('./config/env');

const startServer = async () => {
  try {
    await connectDatabase();
    await ensureDemoAccounts({
      enabled: env.enableDevDemoAccounts,
      nodeEnv: env.nodeEnv,
    });
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
