/**
 * Loyalty tier endpoints
 */

const endpoints = {
  list: '/api/v1/tiers',
  userTier: (userId) => `/api/v1/tiers/user/${userId}`,
  benefits: (tierId) => `/api/v1/tiers/${tierId}/benefits`,
  upgrade: '/api/v1/tiers/upgrade',
  downgrade: '/api/v1/tiers/downgrade',
  progress: (userId) => `/api/v1/tiers/user/${userId}/progress`,
};

module.exports = { endpoints };
