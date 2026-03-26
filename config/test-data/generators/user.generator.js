/**
 * Test data generator for users
 */

const { randomId } = require('../../../src/core/utilities/helpers');

const TIERS = ['standard', 'prime', 'diamond'];
const AREA_CODES = ['090', '091', '093', '094', '096', '097', '098'];

function generateUser(overrides = {}) {
  const tier = TIERS[Math.floor(Math.random() * TIERS.length)];
  const areaCode = AREA_CODES[Math.floor(Math.random() * AREA_CODES.length)];
  const phoneNumber = `${areaCode}${Math.floor(1000000 + Math.random() * 9000000)}`;

  return {
    userId: randomId('USR_'),
    fullName: `Test User ${Date.now().toString(36)}`,
    phone: phoneNumber,
    email: `testuser_${Date.now()}@test.lynkid.vn`,
    tier,
    pointBalance: Math.floor(Math.random() * 100000),
    totalEarned: 0,
    totalRedeemed: 0,
    linkedPartners: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function generateStandardUser(overrides = {}) {
  return generateUser({ tier: 'standard', pointBalance: Math.floor(Math.random() * 10000), ...overrides });
}

function generatePrimeUser(overrides = {}) {
  return generateUser({ tier: 'prime', pointBalance: 50000 + Math.floor(Math.random() * 100000), ...overrides });
}

function generateDiamondUser(overrides = {}) {
  return generateUser({ tier: 'diamond', pointBalance: 200000 + Math.floor(Math.random() * 500000), ...overrides });
}

function generateUserWithZeroBalance(overrides = {}) {
  return generateUser({ pointBalance: 0, ...overrides });
}

module.exports = {
  generateUser,
  generateStandardUser,
  generatePrimeUser,
  generateDiamondUser,
  generateUserWithZeroBalance,
};
