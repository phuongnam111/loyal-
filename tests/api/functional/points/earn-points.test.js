/**
 * Earn Points - Functional Tests
 * Tests: happy path, invalid amount, duplicate, insufficient data, earn rules
 */

const { BaseClient } = require('../../../../src/core/api-client/base-client');
const { ResponseValidator } = require('../../../../src/core/api-client/response-validator');
const { EarnPointsService } = require('../../../../src/services/points/earn-points.service');
const { getConfig } = require('../../../../src/core/config/config-loader');
const { presetUsers } = require('../../../../src/fixtures/users/user.fixture');
const { presetTransactions } = require('../../../../src/fixtures/transactions/transaction.fixture');
const { Logger } = require('../../../../src/core/utilities/logger');
const { Reporter } = require('../../../../src/core/utilities/reporter');

const config = getConfig();
const logger = new Logger(config.logLevel);
const reporter = new Reporter();

let client;
let earnService;

async function setup() {
  client = new BaseClient({
    baseUrl: config.baseUrl,
    timeout: config.timeout,
    logLevel: config.logLevel,
  });
  earnService = new EarnPointsService(client);
  logger.info('=== Earn Points Functional Tests ===');
}

// ─────────────────────────────────────────────────────────────────────
// TEST CASES
// ─────────────────────────────────────────────────────────────────────

async function test_earn_points_happy_path() {
  const testName = 'TC_EARN_001 - Earn points successfully with valid data';
  try {
    const user = presetUsers.standardUser();
    const response = await earnService.earn(user.userId, 1000, 'banking', {
      description: 'Test banking transaction',
    });
    ResponseValidator.validateStatus(response, [200, 201]);
    const data = await ResponseValidator.parseJson(response);

    // Validate response schema
    const validation = ResponseValidator.validateSchema(data, {
      required: ['transactionId', 'userId', 'amount', 'status'],
      properties: {
        transactionId: { type: 'string' },
        userId: { type: 'string' },
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

async function test_earn_points_invalid_amount() {
  const testName = 'TC_EARN_002 - Reject earning with zero/negative amount';
  try {
    const user = presetUsers.standardUser();

    // Test zero amount
    const response = await earnService.earn(user.userId, 0, 'banking');
    ResponseValidator.validateStatus(response, [400, 422]);
    const data = await ResponseValidator.parseJson(response);

    if (!data.error && !data.message) throw new Error('Expected error message in response');
    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    if (error.status === 400 || error.status === 422) {
      reporter.record(testName, { passed: true });
      logger.info(`✅ PASSED: ${testName} (rejected with status ${error.status})`);
    } else {
      reporter.record(testName, { passed: false, error: error.message });
      logger.error(`❌ FAILED: ${testName} - ${error.message}`);
    }
  }
}

async function test_earn_points_exceeds_max_annual() {
  const testName = 'TC_EARN_003 - Reject earning that exceeds annual max (50M points)';
  try {
    const user = presetUsers.diamondUser();
    const maxAnnual = config.points?.maxAnnualAccumulation || 50000000;

    const response = await earnService.earn(user.userId, maxAnnual + 1, 'banking');
    ResponseValidator.validateStatus(response, [400, 422]);

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    if (error.status === 400 || error.status === 422) {
      reporter.record(testName, { passed: true });
      logger.info(`✅ PASSED: ${testName} (rejected as expected)`);
    } else {
      reporter.record(testName, { passed: false, error: error.message });
      logger.error(`❌ FAILED: ${testName} - ${error.message}`);
    }
  }
}

async function test_earn_points_missing_user_id() {
  const testName = 'TC_EARN_004 - Reject earning with missing userId';
  try {
    const response = await earnService.earn(null, 1000, 'banking');
    ResponseValidator.validateStatus(response, [400, 422]);

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    if (error.status === 400 || error.status === 422) {
      reporter.record(testName, { passed: true });
      logger.info(`✅ PASSED: ${testName} (rejected as expected)`);
    } else {
      reporter.record(testName, { passed: false, error: error.message });
      logger.error(`❌ FAILED: ${testName} - ${error.message}`);
    }
  }
}

async function test_get_earn_rules() {
  const testName = 'TC_EARN_005 - Get earn rules configuration';
  try {
    const response = await earnService.getEarnRules();
    ResponseValidator.validateStatus(response, 200);
    const data = await ResponseValidator.parseJson(response);

    if (!data || (Array.isArray(data) && data.length === 0 && !data.rules)) {
      throw new Error('Expected earn rules data');
    }

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    reporter.record(testName, { passed: false, error: error.message });
    logger.error(`❌ FAILED: ${testName} - ${error.message}`);
  }
}

async function test_get_point_balance() {
  const testName = 'TC_EARN_006 - Get point balance for valid user';
  try {
    const user = presetUsers.primeUser();
    const response = await earnService.getBalance(user.userId);
    ResponseValidator.validateStatus(response, 200);
    const data = await ResponseValidator.parseJson(response);

    const validation = ResponseValidator.validateSchema(data, {
      required: ['userId', 'balance'],
      properties: {
        userId: { type: 'string' },
        balance: { type: 'number', minimum: 0 },
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

// ─────────────────────────────────────────────────────────────────────
// RUNNER
// ─────────────────────────────────────────────────────────────────────

async function run() {
  await setup();
  await test_earn_points_happy_path();
  await test_earn_points_invalid_amount();
  await test_earn_points_exceeds_max_annual();
  await test_earn_points_missing_user_id();
  await test_get_earn_rules();
  await test_get_point_balance();

  const summary = reporter.getSummary();
  logger.info(`\n📊 Results: ${summary.passed}/${summary.total} passed, ${summary.failed} failed`);
  return summary;
}

module.exports = { run };

if (require.main === module) {
  run().then((summary) => {
    process.exit(summary.failed > 0 ? 1 : 0);
  });
}
