const Payment = require('../models/Payment');
const Property = require('../models/Property');
const User = require('../models/User');
const env = require('../config/env');
const stripe = require('../config/stripe');
const { PAYMENT_STATUS, NOTIFICATION_TYPE } = require('../constants/appConstants');
const { generateReceiptNumber } = require('../utils/security');
const { generateReceiptPdf } = require('../utils/pdf');
const { createNotification } = require('./notificationService');

const createOrUpdatePendingPayment = async ({ userId, propertyId, amount, month }) =>
  Payment.findOneAndUpdate(
    { userId, propertyId, month },
    {
      $set: {
        amount,
        month,
        currency: env.stripe.currency,
        status: PAYMENT_STATUS.PENDING,
        receiptNumber: generateReceiptNumber(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

const finalizePayment = async (payment, payload = {}) => {
  if (!payment || payment.status === PAYMENT_STATUS.PAID) {
    return payment;
  }

  payment.status = PAYMENT_STATUS.PAID;
  payment.paidDate = payload.paidDate || new Date();
  payment.transactionId = payload.transactionId || payment.transactionId;
  payment.stripePaymentIntentId = payload.stripePaymentIntentId || payment.stripePaymentIntentId;
  payment.stripeSessionId = payload.stripeSessionId || payment.stripeSessionId;
  await payment.save();

  const [user, property] = await Promise.all([
    User.findById(payment.userId),
    Property.findById(payment.propertyId),
  ]);

  if (user && property) {
    const receipt = await generateReceiptPdf({ payment, user, property });
    payment.receiptUrl = receipt.url;
    await payment.save();

    await createNotification({
      recipientId: user._id,
      recipientModel: 'User',
      title: 'Payment successful',
      body: `Your rent payment for ${property.title} has been recorded.`,
      type: NOTIFICATION_TYPE.PAYMENT,
      data: {
        paymentId: String(payment._id),
      },
    });
  }

  return payment;
};

const createStripeCheckoutSession = async ({ payment, property, customerEmail }) => {
  if (!stripe) {
    return null;
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${env.clientBaseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.clientBaseUrl}/payment-cancelled`,
    customer_email: customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: env.stripe.currency,
          unit_amount: Math.round(payment.amount * 100),
          product_data: {
            name: `${property.title} rent`,
            description: `Rent payment for ${payment.month}`,
          },
        },
      },
    ],
    metadata: {
      paymentId: String(payment._id),
      propertyId: String(property._id),
      userId: String(payment.userId),
      month: payment.month,
    },
  });

  payment.stripeSessionId = session.id;
  await payment.save();
  return session;
};

module.exports = {
  stripe,
  createOrUpdatePendingPayment,
  finalizePayment,
  createStripeCheckoutSession,
};
