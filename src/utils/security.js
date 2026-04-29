const crypto = require('crypto');

const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const generateReceiptNumber = () =>
  `RNT-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

module.exports = {
  generateOtp,
  generateReceiptNumber,
};
