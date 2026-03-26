/**
 * Voucher service - CRUD, claim, use, validate vouchers
 */

class VoucherService {
  constructor(apiClient, config = {}) {
    this.client = apiClient;
    this.basePath = config.basePath || '/api/v1/vouchers';
  }

  /** Get voucher catalog with pagination and filters */
  async getCatalog(params = {}) {
    const query = new URLSearchParams(params).toString();
    const path = query ? `${this.basePath}/catalog?${query}` : `${this.basePath}/catalog`;
    return this.client.get(path);
  }

  /** Get voucher detail by ID */
  async getDetail(voucherId) {
    return this.client.get(`${this.basePath}/${voucherId}`);
  }

  /** Claim a voucher for a user */
  async claim(userId, voucherId, metadata = {}) {
    return this.client.post(`${this.basePath}/claim`, {
      userId,
      voucherId,
      ...metadata,
    });
  }

  /** Use/consume a claimed voucher */
  async use(userId, userVoucherId, metadata = {}) {
    return this.client.post(`${this.basePath}/use`, {
      userId,
      userVoucherId,
      ...metadata,
    });
  }

  /** Validate a voucher code */
  async validate(code) {
    return this.client.post(`${this.basePath}/validate`, { code });
  }

  /** Get all vouchers claimed by a user */
  async getUserVouchers(userId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const path = query
      ? `${this.basePath}/user/${userId}?${query}`
      : `${this.basePath}/user/${userId}`;
    return this.client.get(path);
  }

  /** Search vouchers by category */
  async searchByCategory(category, params = {}) {
    return this.getCatalog({ category, ...params });
  }

  /** Search vouchers by partner */
  async searchByPartner(partnerId, params = {}) {
    return this.getCatalog({ partnerId, ...params });
  }
}

module.exports = { VoucherService };
