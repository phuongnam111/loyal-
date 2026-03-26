/**
 * QR Payment service - generate, verify, and track QR payments
 */

class QrPaymentService {
  constructor(apiClient, config = {}) {
    this.client = apiClient;
    this.basePath = config.basePath || '/api/v1/qr-payment';
  }

  /** Generate a QR code for payment at merchant */
  async generateQr(userId, merchantId, amount, metadata = {}) {
    return this.client.post(`${this.basePath}/generate`, {
      userId,
      merchantId,
      amount,
      ...metadata,
    });
  }

  /** Verify a QR payment (merchant-side) */
  async verifyPayment(qrCode, merchantId, metadata = {}) {
    return this.client.post(`${this.basePath}/verify`, {
      qrCode,
      merchantId,
      ...metadata,
    });
  }

  /** Get transaction status by transaction ID */
  async getTransactionStatus(transactionId) {
    return this.client.get(`${this.basePath}/status/${transactionId}`);
  }

  /** List available merchants */
  async getMerchants(params = {}) {
    const query = new URLSearchParams(params).toString();
    const path = query ? `${this.basePath}/merchants?${query}` : `${this.basePath}/merchants`;
    return this.client.get(path);
  }
}

module.exports = { QrPaymentService };
