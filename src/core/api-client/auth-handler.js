/**
 * Authentication handler - manages Bearer tokens, API keys, OAuth2
 */

class AuthHandler {
  constructor(options = {}) {
    this.strategy = options.strategy || 'bearer'; // 'bearer' | 'apikey' | 'oauth2'
    this.token = options.token || null;
    this.apiKey = options.apiKey || '';
    this.tokenExpiry = null;
    this.refreshBuffer = options.refreshBuffer || 60000; // refresh 60s before expiry
    this.loginFn = options.loginFn || null; // async function that returns { token, expiresIn }
    this.refreshFn = options.refreshFn || null;
  }

  /**
   * Login and obtain a new token
   */
  async login(credentials) {
    if (!this.loginFn) {
      throw new Error('No login function configured. Set loginFn in AuthHandler options.');
    }
    const result = await this.loginFn(credentials);
    this.token = result.token || result.access_token;
    if (result.expiresIn || result.expires_in) {
      const expiresInMs = (result.expiresIn || result.expires_in) * 1000;
      this.tokenExpiry = Date.now() + expiresInMs;
    }
    return this.token;
  }

  /**
   * Refresh the token if expired or about to expire
   */
  async refreshIfNeeded() {
    if (!this.tokenExpiry) return;
    const timeUntilExpiry = this.tokenExpiry - Date.now();
    if (timeUntilExpiry > this.refreshBuffer) return;

    if (this.refreshFn) {
      const result = await this.refreshFn(this.token);
      this.token = result.token || result.access_token;
      if (result.expiresIn || result.expires_in) {
        const expiresInMs = (result.expiresIn || result.expires_in) * 1000;
        this.tokenExpiry = Date.now() + expiresInMs;
      }
    }
  }

  /**
   * Check if currently authenticated
   */
  isAuthenticated() {
    if (!this.token) return false;
    if (this.tokenExpiry && Date.now() >= this.tokenExpiry) return false;
    return true;
  }

  /**
   * Get authorization headers based on strategy
   */
  getAuthHeaders() {
    switch (this.strategy) {
      case 'bearer':
        return this.token ? { Authorization: `Bearer ${this.token}` } : {};
      case 'apikey':
        return this.apiKey ? { 'X-API-Key': this.apiKey } : {};
      case 'oauth2':
        return this.token ? { Authorization: `Bearer ${this.token}` } : {};
      default:
        return {};
    }
  }

  /**
   * Set token directly (useful for tests or pre-obtained tokens)
   */
  setToken(token, expiresInSeconds) {
    this.token = token;
    if (expiresInSeconds) {
      this.tokenExpiry = Date.now() + expiresInSeconds * 1000;
    }
  }

  /**
   * Clear authentication state
   */
  clear() {
    this.token = null;
    this.tokenExpiry = null;
  }
}

module.exports = { AuthHandler };
