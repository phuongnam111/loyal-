/**
 * QR Payment - Functional Tests
 * Tests: generate QR, verify payment, transaction status, merchant list
 */

const { BaseClient } = require('../../../../src/core/api-client/base-client');
const { ResponseValidator } = require('../../../../src/core/api-client/response-validator');
const { QrPaymentService } = require('../../../../src/services/qr-payment/qr-payment.service');
const { getConfig } = require('../../../../src/core/config/config-loader');
const { presetUsers } = require('../../../../src/fixtures/users/user.fixture');
const { Logger } = require('../../../../src/core/utilities/logger');
const { Reporter } = require('../../../../src/core/utilities/reporter');
const { randomId } = require('../../../../src/core/utilities/helpers');

const config = getConfig();
const logger = new Logger(config.logLevel);
const reporter = new Reporter();

let client;
let qrService;

async function setup() {
  client = new BaseClient({ baseUrl: config.baseUrl, timeout: config.timeout });
  qrService = new QrPaymentService(client);
  logger.info('=== QR Payment Functional Tests ===');
}

async function test_generate_qr_code() {
  const testName = 'TC_QR_001 - Generate QR code for payment';
  try {
    const user = presetUsers.primeUser();
    const merchantId = 'MCH_COFFEE_001';
    const response = await qrService.generateQr(user.userId, merchantId, 500);
    ResponseValidator.validateStatus(response, [200, 201]);
    const data = await ResponseValidator.parseJson(response);

    const validation = ResponseValidator.validateSchema(data, {
      required: ['qrCode', 'transactionId'],
      properties: {
        qrCode: { type: 'string', minLength: 1 },
        transactionId: { type: 'string' },
        amount: { type: 'number' },
        expiresAt: { type: 'string' },
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

async function test_verify_qr_payment() {
  const testName = 'TC_QR_002 - Verify QR payment at merchant';
  try {
    const qrCode = randomId('QR_');
    const merchantId = 'MCH_COFFEE_001';
    const response = await qrService.verifyPayment(qrCode, merchantId);
    ResponseValidator.validateStatus(response, [200, 201]);

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    reporter.record(testName, { passed: false, error: error.message });
    logger.error(`❌ FAILED: ${testName} - ${error.message}`);
  }
}

async function test_get_transaction_status() {
  const testName = 'TC_QR_003 - Get QR transaction status';
  try {
    const transactionId = randomId('TXN_');
    const response = await qrService.getTransactionStatus(transactionId);
    ResponseValidator.validateStatus(response, [200, 404]);

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    if (error.status === 404) {
      reporter.record(testName, { passed: true });
      logger.info(`✅ PASSED: ${testName} (404 for non-existent transaction is valid)`);
    } else {
      reporter.record(testName, { passed: false, error: error.message });
      logger.error(`❌ FAILED: ${testName} - ${error.message}`);
    }
  }
}

async function test_list_merchants() {
  const testName = 'TC_QR_004 - List available QR payment merchants';
  try {
    const response = await qrService.getMerchants({ page: 1, limit: 10 });
    ResponseValidator.validateStatus(response, 200);

    reporter.record(testName, { passed: true });
    logger.info(`✅ PASSED: ${testName}`);
  } catch (error) {
    reporter.record(testName, { passed: false, error: error.message });
    logger.error(`❌ FAILED: ${testName} - ${error.message}`);
  }
}

async function run() {
  await setup();
  await test_generate_qr_code();
  await test_verify_qr_payment();
  await test_get_transaction_status();
  await test_list_merchants();

  const summary = reporter.getSummary();
  logger.info(`\n📊 Results: ${summary.passed}/${summary.total} passed, ${summary.failed} failed`);
  return summary;
}

module.exports = { run };

if (require.main === module) {
  run().then((s) => process.exit(s.failed > 0 ? 1 : 0));
}
