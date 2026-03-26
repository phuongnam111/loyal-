/**
 * Partner service - partner listing, point transfer, account linking
 * Supports: Lotusmiles (Vietnam Airlines), SkyJoy (Vietjet Air), Shopee, Lazada, Grab
 */

class PartnerService {
  constructor(apiClient, config = {}) {
    this.client = apiClient;
    this.basePath = config.basePath || '/api/v1/partners';
  }

  /** Get list of available partners */
  async listPartners(params = {}) {
    const query = new URLSearchParams(params).toString();
    const path = query ? `${this.basePath}?${query}` : this.basePath;
    return this.client.get(path);
  }

  /** Get partner detail */
  async getPartnerDetail(partnerId) {
    return this.client.get(`${this.basePath}/${partnerId}`);
  }

  /** Transfer points between LynkiD and a partner program */
  async transferPoints(userId, partnerId, amount, direction = 'to_partner', metadata = {}) {
    return this.client.post(`${this.basePath}/transfer-points`, {
      userId,
      partnerId,
      amount,
      direction, // 'to_partner' | 'from_partner'
      ...metadata,
    });
  }

  /** Get conversion rates between LynkiD and partners */
  async getConvertRates(partnerId) {
    const query = partnerId ? `?partnerId=${partnerId}` : '';
    return this.client.get(`${this.basePath}/convert-rates${query}`);
  }

  /** Link a partner account to LynkiD */
  async linkAccount(userId, partnerId, partnerAccountId, metadata = {}) {
    return this.client.post(`${this.basePath}/link-account`, {
      userId,
      partnerId,
      partnerAccountId,
      ...metadata,
    });
  }

  /** Unlink a partner account from LynkiD */
  async unlinkAccount(userId, partnerId) {
    return this.client.post(`${this.basePath}/unlink-account`, {
      userId,
      partnerId,
    });
  }
}

module.exports = { PartnerService };
