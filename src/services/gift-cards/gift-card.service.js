/**
 * Gift card service - purchase, send, redeem gift cards
 */

class GiftCardService {
  constructor(apiClient, config = {}) {
    this.client = apiClient;
    this.basePath = config.basePath || '/api/v1/gift-cards';
  }

  /** Purchase a gift card using points */
  async purchase(userId, amount, recipientInfo = {}, metadata = {}) {
    return this.client.post(`${this.basePath}/purchase`, {
      userId,
      amount,
      recipientInfo,
      ...metadata,
    });
  }

  /** Send a gift card to another user */
  async send(senderUserId, recipientUserId, cardId, message = '') {
    return this.client.post(`${this.basePath}/send`, {
      senderUserId,
      recipientUserId,
      cardId,
      message,
    });
  }

  /** Redeem a gift card by code */
  async redeem(userId, code) {
    return this.client.post(`${this.basePath}/redeem`, {
      userId,
      code,
    });
  }

  /** Get gift card balance */
  async getBalance(cardId) {
    return this.client.get(`${this.basePath}/${cardId}/balance`);
  }

  /** Get user's gift card history */
  async getUserHistory(userId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const path = query
      ? `${this.basePath}/user/${userId}?${query}`
      : `${this.basePath}/user/${userId}`;
    return this.client.get(path);
  }
}

module.exports = { GiftCardService };
