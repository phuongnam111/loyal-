/**
 * Points API endpoints - enhanced
 */

const endpoints = {
  earn: '/api/v1/points/earn',
  redeem: '/api/v1/points/redeem',
  redeemCancel: '/api/v1/points/redeem/cancel',
  redeemDetail: (redemptionId) => `/api/v1/points/redeem/${redemptionId}`,
  balance: (userId) => `/api/v1/points/balance/${userId}`,
  history: (userId) => `/api/v1/points/history/${userId}`,
  earnRules: '/api/v1/points/earn-rules',
  expiryInfo: (userId) => `/api/v1/points/expiry/${userId}`,
};

module.exports = { endpoints };
