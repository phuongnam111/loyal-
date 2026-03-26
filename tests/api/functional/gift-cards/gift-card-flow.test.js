/**
 * Gift Card Flow - Functional Tests
 * Tests: purchase, send, redeem, balance check
 */

const { BaseClient } = require('../../../../src/core/api-client/base-client');
const { ResponseValidator } = require('../../../../src/core/api-client/response-validator');
const { GiftCardService } = require('../../../../src/services/gift-cards/gift-card.service');
const { getConfig } = require('../../../../src/core/config/config-loader');
const { presetUsers } = require('../../../../src/fixtures/users/user.fixture');
const { presetProducts } = require('../../../../src/fixtures/products/product.fixture');
const { Logger } = require('../../../../src/core/utilities/logger');
const { Reporter } = require('../../../../src/core/utilities/reporter');
const { randomId } = require('../../../../src/core/utilities/helpers');

const config = getConfig();
const logger = new Logger(config.logLevel);
const reporter = new Reporter();

let client;
let giftCardService;

async function setup() {
  client = new BaseClient({ baseUrl: config.baseUrl, timeout: config.timeout });
  giftCardService = new GiftCardService(client);
  logger.info('=== Gift Card Flow Functional Tests ===');
}

async function test_purchase_gift_card() {
  const testName = 'TC_GC_001 - Purchase a gift card with points';
  try {
    const user = presetUsers.diamondUser();
    const response = await giftCardService.purchase(user.userId, 100000, {
      recipientName: 'Nguyễn Văn B',
      recipientPhone: '0901234567',
    });
    ResponseValidator.validateStatus(response, [200, 201]);

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    reporter.record(testName, { passed: false, error: error.message });
    logger.error(`❌ FAILED: ${testName} - ${error.message}`);
  }
}

async function test_send_gift_card() {
  const testName = 'TC_GC_002 - Send gift card to another user';
  try {
    const sender = presetUsers.diamondUser();
    const recipient = presetUsers.standardUser();
    const cardId = randomId('GC_');
    const response = await giftCardService.send(sender.userId, recipient.userId, cardId, 'Chúc mừng sinh nhật!');
    ResponseValidator.validateStatus(response, [200, 201]);

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    reporter.record(testName, { passed: false, error: error.message });
    logger.error(`❌ FAILED: ${testName} - ${error.message}`);
  }
}

async function test_redeem_gift_card() {
  const testName = 'TC_GC_003 - Redeem gift card by code';
  try {
    const user = presetUsers.standardUser();
    const giftCard = presetProducts.giftCard100K();
    const response = await giftCardService.redeem(user.userId, giftCard.code);
    ResponseValidator.validateStatus(response, [200, 201]);

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    reporter.record(testName, { passed: false, error: error.message });
    logger.error(`❌ FAILED: ${testName} - ${error.message}`);
  }
}

async function test_get_gift_card_balance() {
  const testName = 'TC_GC_004 - Check gift card remaining balance';
  try {
    const cardId = randomId('GC_');
    const response = await giftCardService.getBalance(cardId);
    ResponseValidator.validateStatus(response, [200, 404]);

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    if (error.status === 404) {
      reporter.record(testName, { passed: true });
      logger.info(`✅ PASSED: ${testName} (404 is valid for non-existent card)`);
    } else {
      reporter.record(testName, { passed: false, error: error.message });
      logger.error(`❌ FAILED: ${testName} - ${error.message}`);
    }
  }
}

async function run() {
  await setup();
  await test_purchase_gift_card();
  await test_send_gift_card();
  await test_redeem_gift_card();
  await test_get_gift_card_balance();

  const summary = reporter.getSummary();
  logger.info(`\n📊 Results: ${summary.passed}/${summary.total} passed, ${summary.failed} failed`);
  return summary;
}

module.exports = { run };

if (require.main === module) {
  run().then((s) => process.exit(s.failed > 0 ? 1 : 0));
}
