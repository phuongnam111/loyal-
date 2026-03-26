/**
 * Loyalty tier service - tier management, upgrade, downgrade, benefits
 */

class TierService {
  constructor(apiClient, config = {}) {
    this.client = apiClient;
    this.basePath = config.basePath || '/api/v1/tiers';
  }

  /** Get all available tiers and their requirements */
  async listTiers() {
    return this.client.get(this.basePath);
  }

  /** Get a user's current tier */
  async getUserTier(userId) {
    return this.client.get(`${this.basePath}/user/${userId}`);
  }

  /** Get benefits for a specific tier */
  async getTierBenefits(tierId) {
    return this.client.get(`${this.basePath}/${tierId}/benefits`);
  }

  /** Request tier upgrade evaluation */
  async requestUpgrade(userId, metadata = {}) {
    return this.client.post(`${this.basePath}/upgrade`, {
      userId,
      ...metadata,
    });
  }

  /** Request tier downgrade (admin or scheduled) */
  async requestDowngrade(userId, reason, metadata = {}) {
    return this.client.post(`${this.basePath}/downgrade`, {
      userId,
      reason,
      ...metadata,
    });
  }

  /** Get user's progress toward next tier */
  async getTierProgress(userId) {
    return this.client.get(`${this.basePath}/user/${userId}/progress`);
  }
}

module.exports = { TierService };
