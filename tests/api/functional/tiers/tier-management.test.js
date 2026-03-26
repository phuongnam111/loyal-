/**
 * Tier Management - Functional Tests
 * Tests: list tiers, get user tier, tier benefits, upgrade progress
 */

const { BaseClient } = require('../../../../src/core/api-client/base-client');
const { ResponseValidator } = require('../../../../src/core/api-client/response-validator');
const { TierService } = require('../../../../src/services/loyalty-tiers/tier.service');
const { getConfig } = require('../../../../src/core/config/config-loader');
const { presetUsers } = require('../../../../src/fixtures/users/user.fixture');
const { Logger } = require('../../../../src/core/utilities/logger');
const { Reporter } = require('../../../../src/core/utilities/reporter');

const config = getConfig();
const logger = new Logger(config.logLevel);
const reporter = new Reporter();

let client;
let tierService;

async function setup() {
  client = new BaseClient({ baseUrl: config.baseUrl, timeout: config.timeout });
  tierService = new TierService(client);
  logger.info('=== Tier Management Functional Tests ===');
}

async function test_list_all_tiers() {
  const testName = 'TC_TIER_001 - List all available tiers (Standard/Prime/Diamond)';
  try {
    const response = await tierService.listTiers();
    ResponseValidator.validateStatus(response, 200);
    const data = await ResponseValidator.parseJson(response);
    const tiers = Array.isArray(data) ? data : data.tiers || data.data;

    if (!tiers || tiers.length < 3) {
      throw new Error('Expected at least 3 tiers (Standard, Prime, Diamond)');
    }

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    reporter.record(testName, { passed: false, error: error.message });
    logger.error(`❌ FAILED: ${testName} - ${error.message}`);
  }
}

async function test_get_user_tier() {
  const testName = 'TC_TIER_002 - Get user current tier';
  try {
    const user = presetUsers.primeUser();
    const response = await tierService.getUserTier(user.userId);
    ResponseValidator.validateStatus(response, 200);
    const data = await ResponseValidator.parseJson(response);

    const validation = ResponseValidator.validateSchema(data, {
      required: ['userId', 'tier'],
      properties: {
        tier: { type: 'string', enum: ['standard', 'prime', 'diamond'] },
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

async function test_get_tier_benefits() {
  const testName = 'TC_TIER_003 - Get Diamond tier benefits';
  try {
    const response = await tierService.getTierBenefits('diamond');
    ResponseValidator.validateStatus(response, 200);
    const data = await ResponseValidator.parseJson(response);

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    reporter.record(testName, { passed: false, error: error.message });
    logger.error(`❌ FAILED: ${testName} - ${error.message}`);
  }
}

async function test_get_upgrade_progress() {
  const testName = 'TC_TIER_004 - Get tier upgrade progress for near-upgrade user';
  try {
    const user = presetUsers.nearUpgradeUser();
    const response = await tierService.getTierProgress(user.userId);
    ResponseValidator.validateStatus(response, 200);
    const data = await ResponseValidator.parseJson(response);

    const validation = ResponseValidator.validateSchema(data, {
      required: ['currentTier', 'nextTier'],
      properties: {
        currentTier: { type: 'string' },
        nextTier: { type: 'string' },
        progress: { type: 'number', minimum: 0, maximum: 100 },
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

async function run() {
  await setup();
  await test_list_all_tiers();
  await test_get_user_tier();
  await test_get_tier_benefits();
  await test_get_upgrade_progress();

  const summary = reporter.getSummary();
  logger.info(`\n📊 Results: ${summary.passed}/${summary.total} passed, ${summary.failed} failed`);
  return summary;
}

module.exports = { run };

if (require.main === module) {
  run().then((s) => process.exit(s.failed > 0 ? 1 : 0));
}
