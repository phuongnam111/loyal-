/**
 * Redeem points service - enhanced with cancel, detail
 */

class RedeemPointsService {
  constructor(apiClient, config = {}) {
    this.client = apiClient;
    this.basePath = config.basePath || '/api/v1/points';
  }

  /** Redeem points for a reward */
  async redeem(userId, amount, rewardId, metadata = {}) {
    return this.client.post(`${this.basePath}/redeem`, {
      userId,
      amount,
      rewardId,
      ...metadata,
    });
  }

  /** Get user's redemption history */
  async getRedemptionHistory(userId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const path = query
      ? `${this.basePath}/history/${userId}?type=redeem&${query}`
      : `${this.basePath}/history/${userId}?type=redeem`;
    return this.client.get(path);
  }

  /** Cancel a pending redemption */
  async cancelRedemption(userId, redemptionId, reason = '') {
    return this.client.post(`${this.basePath}/redeem/cancel`, {
      userId,
      redemptionId,
      reason,
    });
  }

  /** Get details of a specific redemption */
  async getRedemptionDetail(redemptionId) {
    return this.client.get(`${this.basePath}/redeem/${redemptionId}`);
  }
}

module.exports = { RedeemPointsService };
