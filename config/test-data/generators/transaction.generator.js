/**
 * Test data generator for transactions
 */

const { randomId } = require('../../../src/core/utilities/helpers');

const TYPES = ['earn', 'redeem', 'qr_payment', 'transfer', 'gift_card'];
const SOURCES = ['banking', 'credit_card', 'partner', 'promotion', 'referral'];
const CHANNELS = ['app', 'web', 'pos', 'api'];
const STATUSES = ['pending', 'completed', 'failed', 'cancelled'];

function generateTransaction(overrides = {}) {
  const type = TYPES[Math.floor(Math.random() * TYPES.length)];
  const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];
  const channel = CHANNELS[Math.floor(Math.random() * CHANNELS.length)];

  return {
    transactionId: randomId('TXN_'),
    userId: overrides.userId || randomId('USR_'),
    type,
    amount: Math.floor(100 + Math.random() * 50000),
    status: 'pending',
    source,
    metadata: {
      description: `Test ${type} transaction`,
      channel,
      referenceId: randomId('REF_'),
    },
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function generateEarnTransaction(userId, amount, overrides = {}) {
  return generateTransaction({
    userId,
    type: 'earn',
    amount: amount || Math.floor(100 + Math.random() * 10000),
    source: 'banking',
    ...overrides,
  });
}

function generateRedeemTransaction(userId, amount, rewardId, overrides = {}) {
  return generateTransaction({
    userId,
    type: 'redeem',
    amount: amount || Math.floor(100 + Math.random() * 5000),
    rewardId: rewardId || randomId('RWD_'),
    ...overrides,
  });
}

function generateQrPaymentTransaction(userId, merchantId, amount, overrides = {}) {
  return generateTransaction({
    userId,
    type: 'qr_payment',
    amount: amount || Math.floor(50 + Math.random() * 5000),
    merchantId: merchantId || randomId('MCH_'),
    metadata: { channel: 'pos', description: 'QR payment at merchant' },
    ...overrides,
  });
}

module.exports = {
  generateTransaction,
  generateEarnTransaction,
  generateRedeemTransaction,
  generateQrPaymentTransaction,
};
