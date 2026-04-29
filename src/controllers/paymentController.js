const dayjs = require('dayjs');
const Payment = require('../models/Payment');
const Property = require('../models/Property');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const env = require('../config/env');
const {
  createOrUpdatePendingPayment,
  createStripeCheckoutSession,
  finalizePayment,
  stripe,
} = require('../services/paymentService');

const createCheckoutSession = catchAsync(async (req, res) => {
  const property = await Property.findById(req.body.propertyId);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  const amount = Number(req.body.amount || property.rent);
  const month = req.body.month || dayjs().format('MMMM YYYY');
  const existingPaidPayment = await Payment.findOne({
    userId: req.user._id,
    propertyId: property._id,
    month,
    status: 'paid',
  });

  if (existingPaidPayment) {
    throw new ApiError(409, 'Rent for this month is already paid');
  }

  const payment = await createOrUpdatePendingPayment({
    userId: req.user._id,
    propertyId: property._id,
    amount,
    month,
  });

  if (!stripe) {
    const completedPayment = await finalizePayment(payment, {
      transactionId: `DEMO-${Date.now()}`,
      paidDate: new Date(),
    });

    return res.json({
      success: true,
      message: 'Stripe not configured. Demo payment marked successful.',
      data: {
        checkoutUrl: null,
        payment: completedPayment,
      },
    });
  }

  const session = await createStripeCheckoutSession({
    payment,
    property,
    customerEmail: req.user.email,
  });

  return res.json({
    success: true,
    message: 'Checkout session created',
    data: {
      sessionId: session.id,
      checkoutUrl: session.url,
      paymentId: payment._id,
    },
  });
});

const verifyCheckoutSession = catchAsync(async (req, res) => {
  if (!stripe) {
    throw new ApiError(400, 'Stripe is not configured');
  }

  const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);

  if (session.payment_status !== 'paid') {
    throw new ApiError(400, 'Payment is not completed yet');
  }

  const payment = await Payment.findOne({
    $or: [{ stripeSessionId: session.id }, { _id: session.metadata?.paymentId }],
  });

  if (!payment) {
    throw new ApiError(404, 'Payment record not found');
  }

  const updated = await finalizePayment(payment, {
    stripeSessionId: session.id,
    transactionId: session.payment_intent,
    stripePaymentIntentId: session.payment_intent,
    paidDate: new Date(),
  });

  return res.json({
    success: true,
    message: 'Payment verified successfully',
    data: updated,
  });
});

const stripeWebhook = catchAsync(async (req, res) => {
  if (!stripe || !env.stripe.webhookSecret) {
    return res.status(200).json({ received: true });
  }

  const signature = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, signature, env.stripe.webhookSecret);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const payment = await Payment.findOne({
      $or: [{ stripeSessionId: session.id }, { _id: session.metadata?.paymentId }],
    });

    if (payment) {
      await finalizePayment(payment, {
        stripeSessionId: session.id,
        transactionId: session.payment_intent,
        stripePaymentIntentId: session.payment_intent,
        paidDate: new Date(),
      });
    }
  }

  return res.status(200).json({ received: true });
});

const getMyPayments = catchAsync(async (req, res) => {
  const payments = await Payment.find({ userId: req.user._id }).populate('propertyId').sort({ createdAt: -1 });
  return res.json({ success: true, data: payments });
});

const getPayments = catchAsync(async (_req, res) => {
  const payments = await Payment.find().populate('userId', 'fullName email').populate('propertyId').sort({ createdAt: -1 });
  return res.json({ success: true, data: payments });
});

const getReceipt = catchAsync(async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment || !payment.receiptUrl) {
    throw new ApiError(404, 'Receipt not found');
  }

  return res.json({
    success: true,
    data: {
      receiptUrl: payment.receiptUrl,
    },
  });
});

module.exports = {
  createCheckoutSession,
  verifyCheckoutSession,
  stripeWebhook,
  getMyPayments,
  getPayments,
  getReceipt,
};
