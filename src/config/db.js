const mongoose = require('mongoose');
const env = require('./env');

const connectDatabase = async () => {
  mongoose.set('strictQuery', true);

  console.log('Connecting MongoDB...');
  await mongoose.connect(env.mongoUri);

  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};

module.exports = connectDatabase;