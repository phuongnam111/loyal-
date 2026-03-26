/**
 * API Test Runner - runs functional, integration, and e2e API tests
 */

const { Logger } = require('../../src/core/utilities/logger');
const { getConfig } = require('../../src/core/config/config-loader');

const config = getConfig();
const logger = new Logger(config.logLevel);

const TEST_SUITES = [
  { name: 'Earn Points', path: './functional/points/earn-points.test' },
  { name: 'Redeem Points', path: './functional/points/redeem-points.test' },
  { name: 'Voucher Claim', path: './functional/vouchers/voucher-claim.test' },
  { name: 'Tier Management', path: './functional/tiers/tier-management.test' },
  { name: 'QR Payment', path: './functional/qr-payment/qr-generate.test' },
  { name: 'Gift Card Flow', path: './functional/gift-cards/gift-card-flow.test' },
  { name: 'Integration - Earn & Redeem', path: './integration/earn-and-redeem.test' },
  { name: 'E2E - Full Journey', path: './e2e/full-loyalty-journey.test' },
];

async function run() {
  logger.info('=== API Test Runner ===');

  let totalPassed = 0, totalFailed = 0, totalTests = 0;

  for (const suite of TEST_SUITES) {
    try {
      logger.info(`\n── ${suite.name} ──`);
      const mod = require(suite.path);
      const result = await mod.run();
      totalPassed += result.passed || 0;
      totalFailed += result.failed || 0;
      totalTests += result.total || 0;
    } catch (e) {
      logger.error(`Failed to run ${suite.name}: ${e.message}`);
      totalFailed++;
      totalTests++;
    }
  }

  logger.info(`\n📊 API Total: ${totalPassed}/${totalTests} passed, ${totalFailed} failed`);
  return { total: totalTests, passed: totalPassed, failed: totalFailed };
}

module.exports = { run };

if (require.main === module) {
  run().then((s) => process.exit(s.failed > 0 ? 1 : 0));
}
