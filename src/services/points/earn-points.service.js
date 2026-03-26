/**
 * Earn points service - enhanced with earn history and rules
 */

class EarnPointsService {
  constructor(apiClient, config = {}) {
    this.client = apiClient;
    this.basePath = config.basePath || '/api/v1/points';
  }

  /** Earn points for a user from a transaction */
  async earn(userId, amount, source = 'banking', metadata = {}) {
    return this.client.post(`${this.basePath}/earn`, {
      userId,
      amount,
      source,
      ...metadata,
    });
  }

  /** Get user's current point balance */
  async getBalance(userId) {
    return this.client.get(`${this.basePath}/balance/${userId}`);
  }

  /** Get user's earn history */
  async getEarnHistory(userId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const path = query
      ? `${this.basePath}/history/${userId}?type=earn&${query}`
      : `${this.basePath}/history/${userId}?type=earn`;
    return this.client.get(path);
  }

  /** Get point earning rules/configuration */
  async getEarnRules() {
    return this.client.get(`${this.basePath}/earn-rules`);
  }

  /** Get point expiry information for a user */
  async getExpiryInfo(userId) {
    return this.client.get(`${this.basePath}/expiry/${userId}`);
  }
}

module.exports = { EarnPointsService };
