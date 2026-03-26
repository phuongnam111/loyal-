/**
 * Smoke Tests - Health check for all API endpoints
 * Verifies all services are accessible and responding properly
 */

const { BaseClient } = require('../../src/core/api-client/base-client');
const { getConfig } = require('../../src/core/config/config-loader');
const { Logger } = require('../../src/core/utilities/logger');
const { Reporter } = require('../../src/core/utilities/reporter');

const config = getConfig();
const logger = new Logger(config.logLevel);
const reporter = new Reporter();

const HEALTH_ENDPOINTS = [
  { name: 'Internal Health', path: '/api/internal/health', method: 'GET' },
  { name: 'Points - Earn Rules', path: '/api/v1/points/earn-rules', method: 'GET' },
  { name: 'Vouchers - Catalog', path: '/api/v1/vouchers/catalog', method: 'GET' },
  { name: 'Tiers - List', path: '/api/v1/tiers', method: 'GET' },
  { name: 'QR Payment - Merchants', path: '/api/v1/qr-payment/merchants', method: 'GET' },
  { name: 'Partners - List', path: '/api/v1/partners', method: 'GET' },
];

async function checkEndpoint(client, endpoint) {
  const testName = `SMOKE - ${endpoint.name} (${endpoint.method} ${endpoint.path})`;
  try {
    const start = Date.now();
    const response = await client.request(endpoint.method, endpoint.path, { skipRetry: true });
    const duration = Date.now() - start;

    const isHealthy = response.status >= 200 && response.status < 500;

    if (isHealthy) {
      reporter.record(testName, { passed: true, duration });
      logger.info(`✅ ${endpoint.name}: ${response.status} (${duration}ms)`);
    } else {
      reporter.record(testName, { passed: false, status: response.status, duration });
      logger.error(`❌ ${endpoint.name}: ${response.status} (${duration}ms)`);
    }
  } catch (error) {
    reporter.record(testName, { passed: false, error: error.message });
    logger.error(`❌ ${endpoint.name}: ${error.message}`);
  }
}

async function run() {
  logger.info('=== Smoke Tests - Health Check ===');
  logger.info(`Environment: ${config.env || 'unknown'}`);
  logger.info(`Base URL: ${config.baseUrl}`);
  logger.info('');

  const client = new BaseClient({
    baseUrl: config.baseUrl,
    timeout: 10000,
    logLevel: 'warn',
  });

  for (const endpoint of HEALTH_ENDPOINTS) {
    await checkEndpoint(client, endpoint);
  }

  const summary = reporter.getSummary();
  logger.info(`\n📊 Smoke Results: ${summary.passed}/${summary.total} healthy, ${summary.failed} unhealthy`);

  if (summary.failed > 0) {
    logger.error('⚠️  Some endpoints are not healthy! Check the results above.');
  } else {
    logger.info('🟢 All endpoints are healthy!');
  }

  return summary;
}

module.exports = { run };

if (require.main === module) {
  run().then((s) => process.exit(s.failed > 0 ? 1 : 0));
}
