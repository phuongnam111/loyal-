/**
 * Voucher Claim - Functional Tests
 * Tests: claim, duplicate claim, expired voucher, out of stock, max claim per user
 */

const { BaseClient } = require('../../../../src/core/api-client/base-client');
const { ResponseValidator } = require('../../../../src/core/api-client/response-validator');
const { VoucherService } = require('../../../../src/services/vouchers/voucher.service');
const { getConfig } = require('../../../../src/core/config/config-loader');
const { presetUsers } = require('../../../../src/fixtures/users/user.fixture');
const { presetProducts } = require('../../../../src/fixtures/products/product.fixture');
const { Logger } = require('../../../../src/core/utilities/logger');
const { Reporter } = require('../../../../src/core/utilities/reporter');

const config = getConfig();
const logger = new Logger(config.logLevel);
const reporter = new Reporter();

let client;
let voucherService;

async function setup() {
  client = new BaseClient({ baseUrl: config.baseUrl, timeout: config.timeout });
  voucherService = new VoucherService(client);
  logger.info('=== Voucher Claim Functional Tests ===');
}

async function test_claim_voucher_success() {
  const testName = 'TC_VCH_001 - Claim voucher successfully';
  try {
    const user = presetUsers.primeUser();
    const voucher = presetProducts.shopeeVoucher50K();
    const response = await voucherService.claim(user.userId, voucher.voucherId);
    ResponseValidator.validateStatus(response, [200, 201]);

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    reporter.record(testName, { passed: false, error: error.message });
    logger.error(`❌ FAILED: ${testName} - ${error.message}`);
  }
}

async function test_claim_expired_voucher() {
  const testName = 'TC_VCH_002 - Reject claiming expired voucher';
  try {
    const user = presetUsers.primeUser();
    const voucher = presetProducts.expiredVoucher();
    const response = await voucherService.claim(user.userId, voucher.voucherId);
    ResponseValidator.validateStatus(response, [400, 410, 422]);

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    if ([400, 410, 422].includes(error.status)) {
      reporter.record(testName, { passed: true });
      logger.info(`✅ PASSED: ${testName}`);
    } else {
      reporter.record(testName, { passed: false, error: error.message });
      logger.error(`❌ FAILED: ${testName} - ${error.message}`);
    }
  }
}

async function test_claim_out_of_stock_voucher() {
  const testName = 'TC_VCH_003 - Reject claiming out-of-stock voucher';
  try {
    const user = presetUsers.standardUser();
    const voucher = presetProducts.outOfStockVoucher();
    const response = await voucherService.claim(user.userId, voucher.voucherId);
    ResponseValidator.validateStatus(response, [400, 409, 422]);

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    if ([400, 409, 422].includes(error.status)) {
      reporter.record(testName, { passed: true });
      logger.info(`✅ PASSED: ${testName}`);
    } else {
      reporter.record(testName, { passed: false, error: error.message });
      logger.error(`❌ FAILED: ${testName} - ${error.message}`);
    }
  }
}

async function test_claim_free_voucher() {
  const testName = 'TC_VCH_004 - Claim free (0 points) voucher';
  try {
    const user = presetUsers.zeroBalanceUser();
    const voucher = presetProducts.freeVoucher();
    const response = await voucherService.claim(user.userId, voucher.voucherId);
    ResponseValidator.validateStatus(response, [200, 201]);

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    reporter.record(testName, { passed: false, error: error.message });
    logger.error(`❌ FAILED: ${testName} - ${error.message}`);
  }
}

async function test_get_voucher_catalog() {
  const testName = 'TC_VCH_005 - Get voucher catalog with filters';
  try {
    const response = await voucherService.getCatalog({ category: 'food', page: 1, limit: 10 });
    ResponseValidator.validateStatus(response, 200);
    const data = await ResponseValidator.parseJson(response);

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    reporter.record(testName, { passed: false, error: error.message });
    logger.error(`❌ FAILED: ${testName} - ${error.message}`);
  }
}

async function run() {
  await setup();
  await test_claim_voucher_success();
  await test_claim_expired_voucher();
  await test_claim_out_of_stock_voucher();
  await test_claim_free_voucher();
  await test_get_voucher_catalog();

  const summary = reporter.getSummary();
  logger.info(`\n📊 Results: ${summary.passed}/${summary.total} passed, ${summary.failed} failed`);
  return summary;
}

module.exports = { run };

if (require.main === module) {
  run().then((s) => process.exit(s.failed > 0 ? 1 : 0));
}
