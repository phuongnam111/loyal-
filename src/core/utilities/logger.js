/**
 * Logger utility
 */

const levels = { debug: 0, info: 1, warn: 2, error: 3 };

class Logger {
  constructor(level = 'info') {
    this.level = levels[level] ?? levels.info;
  }

  log(level, ...args) {
    if (levels[level] >= this.level) {
      const prefix = `[${new Date().toISOString()}] [${level.toUpperCase()}]`;
      console.log(prefix, ...args);
    }
  }

  debug(...args) {
    this.log('debug', ...args);
  }

  info(...args) {
    this.log('info', ...args);
  }

  warn(...args) {
    this.log('warn', ...args);
  }

  error(...args) {
    this.log('error', ...args);
  }
}

module.exports = { Logger, levels };
