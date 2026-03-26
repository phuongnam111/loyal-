/**
 * Smoke Test Runner
 */

const healthCheck = require('./health-check.test');

async function run() {
  return healthCheck.run();
}

module.exports = { run };

if (require.main === module) {
  run().then((s) => process.exit(s.failed > 0 ? 1 : 0));
}
