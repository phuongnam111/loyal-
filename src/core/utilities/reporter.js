/**
 * Test reporter utility
 */

class Reporter {
  constructor(options = {}) {
    this.results = [];
    this.options = options;
  }

  record(name, result) {
    this.results.push({
      name,
      ...result,
      timestamp: new Date().toISOString()
    });
  }

  getResults() {
    return [...this.results];
  }

  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.passed !== false).length;
    const failed = total - passed;
    return { total, passed, failed };
  }

  clear() {
    this.results = [];
  }
}

module.exports = { Reporter };
