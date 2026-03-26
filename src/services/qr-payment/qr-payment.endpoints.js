/**
 * QR Payment endpoints
 */

const endpoints = {
  generate: '/api/v1/qr-payment/generate',
  verify: '/api/v1/qr-payment/verify',
  status: (transactionId) => `/api/v1/qr-payment/status/${transactionId}`,
  merchants: '/api/v1/qr-payment/merchants',
};

module.exports = { endpoints };
