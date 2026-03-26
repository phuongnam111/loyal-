/**
 * Base API client for loyalty automation
 * Enhanced with auth, interceptors, retry, and logging
 */

const { AuthHandler } = require('./auth-handler');
const { withRetry } = require('./retry-handler');
const { Logger } = require('../utilities/logger');

class BaseClient {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || '';
    this.timeout = config.timeout || 30000;
    this.headers = config.headers || { 'Content-Type': 'application/json' };
    this.logger = config.logger || new Logger(config.logLevel || 'info');
    this.auth = config.auth || new AuthHandler();
    this.retryOptions = config.retryOptions || {};

    // Interceptors
    this._requestInterceptors = [];
    this._responseInterceptors = [];
  }

  /**
   * Add a request interceptor
   * @param {Function} fn - (requestOptions) => modifiedRequestOptions
   */
  addRequestInterceptor(fn) {
    this._requestInterceptors.push(fn);
  }

  /**
   * Add a response interceptor
   * @param {Function} fn - (response, requestInfo) => modifiedResponse
   */
  addResponseInterceptor(fn) {
    this._responseInterceptors.push(fn);
  }

  /**
   * Core request method with auth, interceptors, retry, and logging
   */
  async request(method, path, options = {}) {
    const url = `${this.baseUrl}${path}`;

    // Refresh token if needed
    await this.auth.refreshIfNeeded();

    // Build request options
    let reqOptions = {
      method,
      headers: {
        ...this.headers,
        ...this.auth.getAuthHeaders(),
        ...(options.headers || {}),
      },
      signal: AbortSignal.timeout(options.timeout || this.timeout),
      ...options,
    };

    // Apply request interceptors
    for (const interceptor of this._requestInterceptors) {
      reqOptions = (await interceptor(reqOptions)) || reqOptions;
    }

    // Log request
    this.logger.debug(`→ ${method} ${url}`, {
      headers: this._sanitizeHeaders(reqOptions.headers),
      body: reqOptions.body ? JSON.parse(reqOptions.body).constructor.name : undefined,
    });

    const startTime = Date.now();

    // Execute with retry
    const executeFn = async () => {
      const response = await fetch(url, reqOptions);
      if (!response.ok && [408, 429, 500, 502, 503].includes(response.status)) {
        const err = new Error(`HTTP ${response.status}`);
        err.status = response.status;
        err.response = response;
        throw err;
      }
      return response;
    };

    let response;
    if (options.skipRetry) {
      response = await executeFn();
    } else {
      response = await withRetry(executeFn, this.retryOptions);
    }

    const duration = Date.now() - startTime;

    // Log response
    this.logger.debug(`← ${response.status} ${method} ${url} (${duration}ms)`);

    // Apply response interceptors
    for (const interceptor of this._responseInterceptors) {
      response = (await interceptor(response, { method, url, duration })) || response;
    }

    return response;
  }

  get(path, options = {}) {
    return this.request('GET', path, options);
  }

  post(path, body, options = {}) {
    return this.request('POST', path, {
      ...options,
      body: JSON.stringify(body),
    });
  }

  put(path, body, options = {}) {
    return this.request('PUT', path, {
      ...options,
      body: JSON.stringify(body),
    });
  }

  patch(path, body, options = {}) {
    return this.request('PATCH', path, {
      ...options,
      body: JSON.stringify(body),
    });
  }

  delete(path, options = {}) {
    return this.request('DELETE', path, options);
  }

  /**
   * Remove sensitive info from headers for logging
   */
  _sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    if (sanitized.Authorization) sanitized.Authorization = '***';
    if (sanitized['X-API-Key']) sanitized['X-API-Key'] = '***';
    return sanitized;
  }
}

module.exports = { BaseClient };
