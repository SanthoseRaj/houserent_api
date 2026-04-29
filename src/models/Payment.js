const mongoose = require('mongoose');
const { PAYMENT_STATUS } = require('../constants/appConstants');

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    paidDate: Date,
    paymentMethod: {
      type: String,
      default: 'stripe_checkout',
    },
    transactionId: String,
    receiptUrl: String,
    receiptNumber: String,
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    currency: {
      type: String,
      default: 'inr',
    },
    stripeSessionId: String,
    stripePaymentIntentId: String,
    metadata: {
      type: Map,
      of: String,
    },
  },
  { timestamps: true },
);

paymentSchema.index({ userId: 1, propertyId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema);
