/**
 * Voucher API endpoints
 */

const endpoints = {
  catalog: '/api/v1/vouchers/catalog',
  detail: (voucherId) => `/api/v1/vouchers/${voucherId}`,
  claim: '/api/v1/vouchers/claim',
  use: '/api/v1/vouchers/use',
  validate: '/api/v1/vouchers/validate',
  userVouchers: (userId) => `/api/v1/vouchers/user/${userId}`,
};

module.exports = { endpoints };
