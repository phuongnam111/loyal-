/**
 * Retry handler for API requests
 */

const defaultOptions = {
  maxRetries: 3,
  delay: 1000,
  backoff: 2,
  retryableStatuses: [408, 429, 500, 502, 503]
};

async function withRetry(fn, options = {}) {
  const opts = { ...defaultOptions, ...options };
  let lastError;
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;
      const status = error.status || error.statusCode;
      const shouldRetry = opts.retryableStatuses.includes(status) && attempt < opts.maxRetries;
      if (!shouldRetry) throw error;
      const delay = opts.delay * Math.pow(opts.backoff, attempt);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

module.exports = { withRetry, defaultOptions };
