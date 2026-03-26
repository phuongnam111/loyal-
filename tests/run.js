/**
 * Master Test Runner - runs all test suites
 */

const { Logger } = require('../src/core/utilities/logger');
const { getConfig } = require('../src/core/config/config-loader');

const config = getConfig();
const logger = new Logger(config.logLevel);

async function run() {
  logger.info('╔══════════════════════════════════════════╗');
  logger.info('║    LynkiD Loyalty Automation - Runner    ║');
  logger.info('╚══════════════════════════════════════════╝');
  logger.info(`Environment: ${config.env || config.baseUrl}`);
  logger.info('');

  const results = [];

  // Run smoke tests first
  try {
    logger.info('── Running Smoke Tests ──');
    const smoke = require('./smoke/health-check.test');
    results.push({ suite: 'Smoke', ...(await smoke.run()) });
  } catch (e) {
    logger.error(`Smoke tests failed to load: ${e.message}`);
    results.push({ suite: 'Smoke', total: 0, passed: 0, failed: 1 });
  }

  // Run API tests
  try {
    logger.info('\n── Running API Tests ──');
    const api = require('./api/run');
    results.push({ suite: 'API', ...(await api.run()) });
  } catch (e) {
    logger.error(`API tests failed to load: ${e.message}`);
    results.push({ suite: 'API', total: 0, passed: 0, failed: 1 });
  }

  // Summary
  logger.info('\n╔══════════════════════════════════════════╗');
  logger.info('║              Final Summary               ║');
  logger.info('╚══════════════════════════════════════════╝');

  let totalPassed = 0, totalFailed = 0, totalTests = 0;
  for (const r of results) {
    totalPassed += r.passed || 0;
    totalFailed += r.failed || 0;
    totalTests += r.total || 0;
    const icon = r.failed === 0 ? '✅' : '❌';
    logger.info(`${icon} ${r.suite}: ${r.passed}/${r.total} passed`);
  }
  logger.info(`\n📊 Total: ${totalPassed}/${totalTests} passed, ${totalFailed} failed`);

  return { total: totalTests, passed: totalPassed, failed: totalFailed };
}

run().then((s) => process.exit(s.failed > 0 ? 1 : 0));
