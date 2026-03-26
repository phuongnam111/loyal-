/**
 * Product fixture - preset vouchers, gift cards, and rewards
 */

const { randomId } = require('../../core/utilities/helpers');

function generateVoucher(overrides = {}) {
  return {
    voucherId: randomId('VCH_'),
    name: 'Test Voucher',
    description: 'Voucher giảm giá test',
    partnerId: randomId('PTN_'),
    partnerName: 'Test Partner',
    category: 'shopping',
    pointCost: 1000,
    originalPrice: 50000,
    discountPercent: 10,
    status: 'active',
    quantity: 100,
    maxClaimPerUser: 3,
    validFrom: new Date().toISOString(),
    validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    termsAndConditions: 'Áp dụng cho đơn hàng từ 100K',
    ...overrides,
  };
}

function generateGiftCard(overrides = {}) {
  return {
    cardId: randomId('GC_'),
    amount: 100000,
    pointCost: 5000,
    code: `GIFT${Date.now().toString(36).toUpperCase()}`,
    status: 'active',
    senderUserId: null,
    recipientUserId: null,
    message: '',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/** Preset products */
const presetProducts = {
  shopeeVoucher50K: () => generateVoucher({
    name: 'Shopee Voucher 50K',
    partnerName: 'Shopee',
    category: 'shopping',
    pointCost: 2000,
    originalPrice: 50000,
    discountPercent: 100,
  }),

  grabVoucher30K: () => generateVoucher({
    name: 'Grab Voucher 30K',
    partnerName: 'Grab',
    category: 'travel',
    pointCost: 1500,
    originalPrice: 30000,
    discountPercent: 100,
  }),

  coffeeVoucher: () => generateVoucher({
    name: 'Gemini Coffee - Mua 1 Tặng 1',
    partnerName: 'Gemini Coffee',
    category: 'food',
    pointCost: 500,
    originalPrice: 45000,
    discountPercent: 50,
  }),

  freeVoucher: () => generateVoucher({
    name: 'Ưu đãi miễn phí - 0 điểm',
    partnerName: 'LynkiD',
    category: 'entertainment',
    pointCost: 0,
    originalPrice: 0,
    discountPercent: 100,
  }),

  expiredVoucher: () => generateVoucher({
    name: 'Voucher đã hết hạn',
    status: 'expired',
    validTo: new Date(Date.now() - 1000).toISOString(),
  }),

  outOfStockVoucher: () => generateVoucher({
    name: 'Voucher hết hàng',
    status: 'out_of_stock',
    quantity: 0,
  }),

  giftCard100K: () => generateGiftCard({
    amount: 100000,
    pointCost: 5000,
    message: 'Chúc mừng sinh nhật!',
  }),

  giftCard500K: () => generateGiftCard({
    amount: 500000,
    pointCost: 25000,
    message: 'Quà tặng đặc biệt',
  }),
};

module.exports = { presetProducts, generateVoucher, generateGiftCard };
