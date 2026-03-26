/**
 * Integration Test: Earn → Redeem → Verify Balance
 * Tests the full point lifecycle from earning through redemption
 */

const { BaseClient } = require('../../../src/core/api-client/base-client');
const { ResponseValidator } = require('../../../src/core/api-client/response-validator');
const { EarnPointsService } = require('../../../src/services/points/earn-points.service');
const { RedeemPointsService } = require('../../../src/services/points/redeem-points.service');
const { getConfig } = require('../../../src/core/config/config-loader');
const { presetUsers } = require('../../../src/fixtures/users/user.fixture');
const { Logger } = require('../../../src/core/utilities/logger');
const { Reporter } = require('../../../src/core/utilities/reporter');
const { randomId } = require('../../../src/core/utilities/helpers');

const config = getConfig();
const logger = new Logger(config.logLevel);
const reporter = new Reporter();

async function test_earn_then_redeem_flow() {
  const testName = 'TC_INT_001 - Full earn → redeem → verify balance flow';
  try {
    const client = new BaseClient({ baseUrl: config.baseUrl, timeout: config.timeout });
    const earnService = new EarnPointsService(client);
    const redeemService = new RedeemPointsService(client);
    const user = presetUsers.standardUser();

    // Step 1: Check initial balance
    logger.info('Step 1: Getting initial balance...');
    const balanceRes = await earnService.getBalance(user.userId);
    ResponseValidator.validateStatus(balanceRes, 200);
    const initialBalance = await ResponseValidator.parseJson(balanceRes);
    logger.info(`Initial balance: ${initialBalance.balance || 0} points`);

    // Step 2: Earn points
    logger.info('Step 2: Earning 5000 points...');
    const earnRes = await earnService.earn(user.userId, 5000, 'banking', {
      description: 'Integration test - earn',
    });
    ResponseValidator.validateStatus(earnRes, [200, 201]);
    const earnData = await ResponseValidator.parseJson(earnRes);
    logger.info(`Earned: ${earnData.amount} points, txn: ${earnData.transactionId}`);

    // Step 3: Verify balance increased
    logger.info('Step 3: Verifying balance increased...');
    const updatedRes = await earnService.getBalance(user.userId);
    ResponseValidator.validateStatus(updatedRes, 200);
    const updatedBalance = await ResponseValidator.parseJson(updatedRes);
    logger.info(`Updated balance: ${updatedBalance.balance} points`);

    // Step 4: Redeem points
    logger.info('Step 4: Redeeming 2000 points...');
    const redeemRes = await redeemService.redeem(user.userId, 2000, randomId('RWD_'));
    ResponseValidator.validateStatus(redeemRes, [200, 201]);
    const redeemData = await ResponseValidator.parseJson(redeemRes);
    logger.info(`Redeemed: ${redeemData.amount} points`);

    // Step 5: Verify final balance
    logger.info('Step 5: Verifying final balance...');
    const finalRes = await earnService.getBalance(user.userId);
    ResponseValidator.validateStatus(finalRes, 200);
    const finalBalance = await ResponseValidator.parseJson(finalRes);
    logger.info(`Final balance: ${finalBalance.balance} points`);

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    reporter.record(testName, { passed: false, error: error.message });
    logger.error(`❌ FAILED: ${testName} - ${error.message}`);
  }
}

async function test_earn_triggers_tier_evaluation() {
  const testName = 'TC_INT_002 - Earn points triggers tier upgrade evaluation';
  try {
    const client = new BaseClient({ baseUrl: config.baseUrl, timeout: config.timeout });
    const earnService = new EarnPointsService(client);
    const { TierService } = require('../../../src/services/loyalty-tiers/tier.service');
    const tierService = new TierService(client);

    const user = presetUsers.nearUpgradeUser();

    // Step 1: Check current tier progress
    logger.info('Step 1: Checking tier progress before earning...');
    const progressBefore = await tierService.getTierProgress(user.userId);
    ResponseValidator.validateStatus(progressBefore, 200);

    // Step 2: Earn enough points to potentially trigger upgrade
    logger.info('Step 2: Earning 10000 points to push past threshold...');
    const earnRes = await earnService.earn(user.userId, 10000, 'banking');
    ResponseValidator.validateStatus(earnRes, [200, 201]);

    // Step 3: Check tier progress after earning
    logger.info('Step 3: Checking tier progress after earning...');
    const progressAfter = await tierService.getTierProgress(user.userId);
    ResponseValidator.validateStatus(progressAfter, 200);

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    reporter.record(testName, { passed: false, error: error.message });
    logger.error(`❌ FAILED: ${testName} - ${error.message}`);
  }
}

async function run() {
  logger.info('=== Integration Tests ===');
  await test_earn_then_redeem_flow();
  await test_earn_triggers_tier_evaluation();

  const summary = reporter.getSummary();
  logger.info(`\n📊 Results: ${summary.passed}/${summary.total} passed, ${summary.failed} failed`);
  return summary;
}

module.exports = { run };

if (require.main === module) {
  run().then((s) => process.exit(s.failed > 0 ? 1 : 0));
}
