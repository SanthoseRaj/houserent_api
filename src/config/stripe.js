const Stripe = require('stripe');
const env = require('./env');

const stripe = env.stripe.secretKey
  ? new Stripe(env.stripe.secretKey, {
      apiVersion: '2026-02-25.clover',
    })
  : null;

module.exports = stripe;
