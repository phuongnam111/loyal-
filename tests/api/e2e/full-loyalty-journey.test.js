/**
 * E2E Test: Full Loyalty Journey
 * Simulates a complete user journey: Register → Earn → Tier Upgrade → Redeem Voucher → QR Payment → Gift Card
 */

const { BaseClient } = require('../../../src/core/api-client/base-client');
const { ResponseValidator } = require('../../../src/core/api-client/response-validator');
const { EarnPointsService } = require('../../../src/services/points/earn-points.service');
const { RedeemPointsService } = require('../../../src/services/points/redeem-points.service');
const { VoucherService } = require('../../../src/services/vouchers/voucher.service');
const { TierService } = require('../../../src/services/loyalty-tiers/tier.service');
const { QrPaymentService } = require('../../../src/services/qr-payment/qr-payment.service');
const { GiftCardService } = require('../../../src/services/gift-cards/gift-card.service');
const { getConfig } = require('../../../src/core/config/config-loader');
const { generateUser } = require('../../../src/fixtures/users/user.fixture');
const { Logger } = require('../../../src/core/utilities/logger');
const { Reporter } = require('../../../src/core/utilities/reporter');
const { sleep } = require('../../../src/core/utilities/helpers');

const config = getConfig();
const logger = new Logger(config.logLevel);
const reporter = new Reporter();

async function test_full_loyalty_journey() {
  const testName = 'TC_E2E_001 - Full loyalty user journey';
  const client = new BaseClient({ baseUrl: config.baseUrl, timeout: config.timeout });

  const earnService = new EarnPointsService(client);
  const redeemService = new RedeemPointsService(client);
  const voucherService = new VoucherService(client);
  const tierService = new TierService(client);
  const qrService = new QrPaymentService(client);
  const giftCardService = new GiftCardService(client);

  try {
    const user = generateUser({ tier: 'standard', pointBalance: 0 });
    logger.info(`\n🚀 Starting full loyalty journey for user: ${user.fullName}`);

    // ── Phase 1: Tích điểm (Earn Points) ──────────────────
    logger.info('\n📍 Phase 1: Tích điểm từ giao dịch ngân hàng');
    const earn1 = await earnService.earn(user.userId, 10000, 'banking');
    ResponseValidator.validateStatus(earn1, [200, 201]);
    logger.info('  ✓ Earned 10,000 points from banking transaction');

    const earn2 = await earnService.earn(user.userId, 25000, 'credit_card');
    ResponseValidator.validateStatus(earn2, [200, 201]);
    logger.info('  ✓ Earned 25,000 points from credit card spending');

    await sleep(500);

    // ── Phase 2: Kiểm tra số dư & Nâng hạng ──────────────
    logger.info('\n📍 Phase 2: Kiểm tra số dư và tiến trình nâng hạng');
    const balance = await earnService.getBalance(user.userId);
    ResponseValidator.validateStatus(balance, 200);
    logger.info('  ✓ Balance verified');

    const progress = await tierService.getTierProgress(user.userId);
    ResponseValidator.validateStatus(progress, 200);
    logger.info('  ✓ Tier progress retrieved');

    // ── Phase 3: Đổi Voucher ──────────────────────────────
    logger.info('\n📍 Phase 3: Đổi voucher Shopee');
    const catalog = await voucherService.getCatalog({ category: 'shopping' });
    ResponseValidator.validateStatus(catalog, 200);
    logger.info('  ✓ Voucher catalog fetched');

    const claimed = await voucherService.claim(user.userId, 'SHOPEE_50K');
    ResponseValidator.validateStatus(claimed, [200, 201]);
    logger.info('  ✓ Shopee 50K voucher claimed');

    // ── Phase 4: Thanh toán QR ────────────────────────────
    logger.info('\n📍 Phase 4: Thanh toán QR tại cửa hàng');
    const qr = await qrService.generateQr(user.userId, 'MCH_COFFEE_001', 500);
    ResponseValidator.validateStatus(qr, [200, 201]);
    logger.info('  ✓ QR code generated for coffee shop payment');

    // ── Phase 5: Gửi Gift Card ────────────────────────────
    logger.info('\n📍 Phase 5: Mua và gửi Gift Card');
    const gc = await giftCardService.purchase(user.userId, 50000, {
      recipientName: 'Bạn thân',
    });
    ResponseValidator.validateStatus(gc, [200, 201]);
    logger.info('  ✓ Gift card purchased and sent');

    // ── Phase 6: Kiểm tra lịch sử ────────────────────────
    logger.info('\n📍 Phase 6: Kiểm tra lịch sử giao dịch');
    const earnHistory = await earnService.getEarnHistory(user.userId);
    ResponseValidator.validateStatus(earnHistory, 200);
    logger.info('  ✓ Earn history retrieved');

    const redeemHistory = await redeemService.getRedemptionHistory(user.userId);
    ResponseValidator.validateStatus(redeemHistory, 200);
    logger.info('  ✓ Redemption history retrieved');

    reporter.record(testName, { passed: true });
    logger.info(`\n✅ PASSED: ${testName}`);
    logger.info('🎉 Full loyalty journey completed successfully!');
  } catch (error) {
    reporter.record(testName, { passed: false, error: error.message });
    logger.error(`\n❌ FAILED: ${testName} - ${error.message}`);
  }
}

async function run() {
  logger.info('=== E2E Tests: Full Loyalty Journey ===');
  await test_full_loyalty_journey();

  const summary = reporter.getSummary();
  logger.info(`\n📊 Results: ${summary.passed}/${summary.total} passed, ${summary.failed} failed`);
  return summary;
}

module.exports = { run };

if (require.main === module) {
  run().then((s) => process.exit(s.failed > 0 ? 1 : 0));
}
