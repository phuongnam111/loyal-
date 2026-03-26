/**
 * Gift card endpoints
 */

const endpoints = {
  purchase: '/api/v1/gift-cards/purchase',
  send: '/api/v1/gift-cards/send',
  redeem: '/api/v1/gift-cards/redeem',
  balance: (cardId) => `/api/v1/gift-cards/${cardId}/balance`,
  userHistory: (userId) => `/api/v1/gift-cards/user/${userId}`,
};

module.exports = { endpoints };
