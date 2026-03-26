/**
 * Redeem Points - Functional Tests
 * Tests: happy path, insufficient balance, invalid reward, cancel, history
 */

const { BaseClient } = require('../../../../src/core/api-client/base-client');
const { ResponseValidator } = require('../../../../src/core/api-client/response-validator');
const { RedeemPointsService } = require('../../../../src/services/points/redeem-points.service');
const { getConfig } = require('../../../../src/core/config/config-loader');
const { presetUsers } = require('../../../../src/fixtures/users/user.fixture');
const { Logger } = require('../../../../src/core/utilities/logger');
const { Reporter } = require('../../../../src/core/utilities/reporter');
const { randomId } = require('../../../../src/core/utilities/helpers');

const config = getConfig();
const logger = new Logger(config.logLevel);
const reporter = new Reporter();

let client;
let redeemService;

async function setup() {
  client = new BaseClient({ baseUrl: config.baseUrl, timeout: config.timeout });
  redeemService = new RedeemPointsService(client);
  logger.info('=== Redeem Points Functional Tests ===');
}

async function test_redeem_points_happy_path() {
  const testName = 'TC_REDEEM_001 - Redeem points successfully';
  try {
    const user = presetUsers.primeUser();
    const rewardId = randomId('RWD_');
    const response = await redeemService.redeem(user.userId, 2000, rewardId);
    ResponseValidator.validateStatus(response, [200, 201]);
    const data = await ResponseValidator.parseJson(response);

    const validation = ResponseValidator.validateSchema(data, {
      required: ['transactionId', 'userId', 'amount', 'rewardId', 'status'],
      properties: {
        transactionId: { type: 'string' },
        amount: { type: 'number', minimum: 1 },
        status: { type: 'string', enum: ['pending', 'completed'] },
      },
    });
    if (!validation.valid) throw new Error(validation.errors.join(', '));

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    reporter.record(testName, { passed: false, error: error.message });
    logger.error(`❌ FAILED: ${testName} - ${error.message}`);
  }
}

async function test_redeem_insufficient_balance() {
  const testName = 'TC_REDEEM_002 - Reject redeem when insufficient balance';
  try {
    const user = presetUsers.zeroBalanceUser();
    const response = await redeemService.redeem(user.userId, 5000, randomId('RWD_'));
    ResponseValidator.validateStatus(response, [400, 422]);

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    if (error.status === 400 || error.status === 422) {
      reporter.record(testName, { passed: true });
      logger.info(`✅ PASSED: ${testName} (insufficient balance rejected)`);
    } else {
      reporter.record(testName, { passed: false, error: error.message });
      logger.error(`❌ FAILED: ${testName} - ${error.message}`);
    }
  }
}

async function test_redeem_invalid_reward_id() {
  const testName = 'TC_REDEEM_003 - Reject redeem with invalid reward ID';
  try {
    const user = presetUsers.primeUser();
    const response = await redeemService.redeem(user.userId, 1000, 'INVALID_REWARD_999');
    ResponseValidator.validateStatus(response, [400, 404, 422]);

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    if ([400, 404, 422].includes(error.status)) {
      reporter.record(testName, { passed: true });
      logger.info(`✅ PASSED: ${testName}`);
    } else {
      reporter.record(testName, { passed: false, error: error.message });
      logger.error(`❌ FAILED: ${testName} - ${error.message}`);
    }
  }
}

async function test_cancel_redemption() {
  const testName = 'TC_REDEEM_004 - Cancel a pending redemption';
  try {
    const user = presetUsers.primeUser();
    const redemptionId = randomId('REDM_');
    const response = await redeemService.cancelRedemption(user.userId, redemptionId, 'Changed mind');
    ResponseValidator.validateStatus(response, [200, 204]);

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    reporter.record(testName, { passed: false, error: error.message });
    logger.error(`❌ FAILED: ${testName} - ${error.message}`);
  }
}

async function test_get_redemption_history() {
  const testName = 'TC_REDEEM_005 - Get redemption history';
  try {
    const user = presetUsers.diamondUser();
    const response = await redeemService.getRedemptionHistory(user.userId, { page: 1, limit: 10 });
    ResponseValidator.validateStatus(response, 200);
    const data = await ResponseValidator.parseJson(response);

    if (!Array.isArray(data) && !data.items && !data.data) {
      throw new Error('Expected array or paginated response');
    }

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    reporter.record(testName, { passed: false, error: error.message });
    logger.error(`❌ FAILED: ${testName} - ${error.message}`);
  }
}

async function run() {
  await setup();
  await test_redeem_points_happy_path();
  await test_redeem_insufficient_balance();
  await test_redeem_invalid_reward_id();
  await test_cancel_redemption();
  await test_get_redemption_history();

  const summary = reporter.getSummary();
  logger.info(`\n📊 Results: ${summary.passed}/${summary.total} passed, ${summary.failed} failed`);
  return summary;
}

module.exports = { run };

if (require.main === module) {
  run().then((s) => process.exit(s.failed > 0 ? 1 : 0));
}
