/**
 * Cleanup manager for test data teardown
 */

class CleanupManager {
  constructor() {
    this.handlers = [];
  }

  register(handler) {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  async run() {
    const errors = [];
    for (const handler of this.handlers.reverse()) {
      try {
        await (typeof handler === 'function' ? handler() : handler.run());
      } catch (e) {
        errors.push(e);
      }
    }
    this.handlers = [];
    if (errors.length) throw new AggregateError(errors, 'Cleanup errors');
  }

  clear() {
    this.handlers = [];
  }
}

module.exports = { CleanupManager };
