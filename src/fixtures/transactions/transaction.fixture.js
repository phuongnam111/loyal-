/**
 * Transaction fixture - creates test transactions for various scenarios
 */

const { generateEarnTransaction, generateRedeemTransaction, generateQrPaymentTransaction } = require('../../../config/test-data/generators/transaction.generator');
const { randomId } = require('../../core/utilities/helpers');

/**
 * Preset transactions for common test scenarios
 */
const presetTransactions = {
  /** Small earn from banking transaction */
  smallEarn: (userId) => generateEarnTransaction(userId, 500, {
    source: 'banking',
    metadata: { description: 'Chuyển khoản ngân hàng', channel: 'app' },
  }),

  /** Large earn from credit card spending */
  largeEarn: (userId) => generateEarnTransaction(userId, 50000, {
    source: 'credit_card',
    metadata: { description: 'Chi tiêu thẻ tín dụng VPBank', channel: 'pos' },
  }),

  /** Earn from promotion campaign */
  promotionEarn: (userId) => generateEarnTransaction(userId, 10000, {
    source: 'promotion',
    metadata: { description: 'Khuyến mãi Tết Nguyên Đán', channel: 'app' },
  }),

  /** Redeem for a Shopee voucher */
  shopeeRedeem: (userId) => generateRedeemTransaction(userId, 2000, randomId('SHOPEE_'), {
    metadata: { description: 'Đổi voucher Shopee 50K', channel: 'app' },
  }),

  /** Redeem for a food voucher */
  foodRedeem: (userId) => generateRedeemTransaction(userId, 1000, randomId('FOOD_'), {
    metadata: { description: 'Đổi voucher ẩm thực', channel: 'app' },
  }),

  /** QR payment at coffee shop */
  coffeeQrPayment: (userId) => generateQrPaymentTransaction(userId, 'MCH_COFFEE_001', 500, {
    metadata: { description: 'Thanh toán QR tại Gemini Coffee', channel: 'pos' },
  }),

  /** QR payment with high amount */
  highValueQrPayment: (userId) => generateQrPaymentTransaction(userId, 'MCH_RESTAURANT_001', 5000, {
    metadata: { description: 'Thanh toán QR tại nhà hàng', channel: 'pos' },
  }),
};

module.exports = {
  presetTransactions,
  generateEarnTransaction,
  generateRedeemTransaction,
  generateQrPaymentTransaction,
};
