const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/house_rent_app',
  jwtSecret: process.env.JWT_SECRET || 'replace-this-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:5000',
  clientBaseUrl: process.env.CLIENT_BASE_URL || 'http://localhost:3000',
  storageDriver: process.env.STORAGE_DRIVER || 'auto',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@houserent.local',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    currency: process.env.STRIPE_CURRENCY || 'inr',
  },
  otpExpiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES || 10),
  devOtpResponse: process.env.ENABLE_DEV_OTP_RESPONSE !== 'false',
  enableDevDemoAccounts: process.env.ENABLE_DEV_DEMO_ACCOUNTS !== 'false',
};

module.exports = env;
