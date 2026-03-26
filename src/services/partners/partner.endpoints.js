/**
 * Partner endpoints
 */

const endpoints = {
  list: '/api/v1/partners',
  detail: (partnerId) => `/api/v1/partners/${partnerId}`,
  transferPoints: '/api/v1/partners/transfer-points',
  convertRates: '/api/v1/partners/convert-rates',
  linkAccount: '/api/v1/partners/link-account',
  unlinkAccount: '/api/v1/partners/unlink-account',
};

module.exports = { endpoints };
