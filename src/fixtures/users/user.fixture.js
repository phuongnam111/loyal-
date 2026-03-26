/**
 * User fixture - creates test users with different tiers and point balances
 */

const { generateUser, generateStandardUser, generatePrimeUser, generateDiamondUser } = require('../../../config/test-data/generators/user.generator');

/**
 * Preset test users for common scenarios
 */
const presetUsers = {
  /** Standard tier user with moderate balance */
  standardUser: () => generateStandardUser({
    fullName: 'Nguyễn Văn A',
    email: 'standard_user@test.lynkid.vn',
    pointBalance: 5000,
  }),

  /** Prime tier user with high balance */
  primeUser: () => generatePrimeUser({
    fullName: 'Trần Thị B',
    email: 'prime_user@test.lynkid.vn',
    pointBalance: 100000,
  }),

  /** Diamond tier user with very high balance */
  diamondUser: () => generateDiamondUser({
    fullName: 'Lê Văn C',
    email: 'diamond_user@test.lynkid.vn',
    pointBalance: 500000,
  }),

  /** User with zero balance - for negative test cases */
  zeroBalanceUser: () => generateUser({
    fullName: 'Phạm Văn D',
    email: 'zero_balance@test.lynkid.vn',
    tier: 'standard',
    pointBalance: 0,
  }),

  /** User with points about to expire */
  expiringPointsUser: () => generateUser({
    fullName: 'Hoàng Thị E',
    email: 'expiring_points@test.lynkid.vn',
    tier: 'prime',
    pointBalance: 30000,
  }),

  /** User close to tier upgrade threshold */
  nearUpgradeUser: () => generateUser({
    fullName: 'Vũ Văn F',
    email: 'near_upgrade@test.lynkid.vn',
    tier: 'standard',
    pointBalance: 49000,
    totalEarned: 195000,
  }),
};

module.exports = { presetUsers, generateUser, generateStandardUser, generatePrimeUser, generateDiamondUser };
