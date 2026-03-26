/**
 * Final Production-Grade Mock API Server for LynkiD Loyalty Framework
 * Matches registry.json and JSON Schemas perfectly
 */

const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  const { method, url } = req;
  res.setHeader('Content-Type', 'application/json');

  let body = '';
  req.on('data', chunk => { body += chunk; });

  req.on('end', () => {
    let payload = {};
    try { if (body) payload = JSON.parse(body); } catch (e) {}

    const send = (status, data) => {
      res.writeHead(status);
      res.end(JSON.stringify(data));
    };

    console.log(`[LOG] ${method} ${url}`);

    // --- 1. AUTH ---
    if (url.includes('/api/v1/auth/login')) return send(200, { token: 'mock-token', expires: 3600 });
    if (url.includes('/api/v1/auth/refresh')) return send(200, { token: 'refreshed-token', expires: 3600 });

    // --- 2. POINTS ---
    if (url.includes('/points/balance/')) return send(200, { userId: 'USR_123', balance: 50000 });
    if (url.includes('/points/earn-rules')) return send(200, { rules: [{ channel: 'banking', rate: 1 }] });
    if (url.includes('/points/history/') || url.includes('/points/earn-history') || url.includes('/points/redemption-history')) {
        return send(200, { 
            transactions: [
                { transactionId: 'T1', userId: 'USR_123', type: 'earn', amount: 1000, status: 'completed', createdAt: new Date().toISOString() },
                { transactionId: 'T2', userId: 'USR_123', type: 'redeem', amount: 500, status: 'completed', createdAt: new Date().toISOString() }
            ]
        });
    }
    if (url.includes('/points/earn')) {
        if (payload.amount <= 0 || payload.amount > 50000000) return send(400, { error: 'Invalid amount' });
        if (!payload.userId) return send(422, { error: 'Missing userId' });
        return send(201, { transactionId: 'TX_E_777', userId: payload.userId || 'USR_123', amount: payload.amount || 1000, type: 'earn', status: 'completed' });
    }
    if (url.includes('/points/redeem')) {
        if (payload.amount <= 0) return send(400, { error: 'Invalid amount' });
        if (payload.rewardId === 'INVALID') return send(400, { error: 'Invalid reward' });
        return send(201, { transactionId: 'TX_R_888', userId: payload.userId || 'USR_123', amount: payload.amount || 2000, type: 'redeem', status: 'completed' });
    }

    // --- 3. VOUCHERS ---
    if (url.includes('/vouchers/catalog')) return send(200, { 
        vouchers: [
            { id: 'SHOPEE_50K', name: 'Shopee 50K', points: 2000, stock: 10 },
            { id: 'EXPIRED_VCH', name: 'Expired', points: 1000, stock: 5, expiryDate: '2020-01-01' },
            { id: 'OUT_OF_STOCK', name: 'No Stock', points: 1000, stock: 0 }
        ]
    });
    if (url.includes('/vouchers/claim')) {
        if (payload.voucherId === 'EXPIRED_VCH') return send(400, { error: 'Voucher expired' });
        if (payload.voucherId === 'OUT_OF_STOCK') return send(400, { error: 'Out of stock' });
        return send(201, { claimId: 'CLM_123', voucherCode: 'MOCK-VCH-123', status: 'active', userId: 'USR_123' });
    }

    // --- 4. TIERS ---
    // Handle /tiers/user/{id}/progress first to avoid /tiers match
    if (url.includes('/progress')) return send(200, { 
        userId: 'USR_123', currentTier: 'standard', nextTier: 'prime', pointsToUpgrade: 1000, progressPercentage: 80 
    });
    if (url.includes('/benefits')) return send(200, { tier: 'diamond', benefits: ['Lounge access'] });
    if (url.includes('/tiers/user/')) return send(200, { userId: 'USR_123', tier: 'standard', fullName: 'Test User', phone: '0901234567', email: 'test@lynkid.vn' });
    if (url === '/api/v1/tiers' || url === '/api/v1/tiers/') return send(200, { tiers: [{ id: 'standard' }, { id: 'prime' }, { id: 'diamond' }] });

    // --- 5. QR PAYMENT ---
    if (url.includes('/qr-payment/generate')) return send(201, { transactionId: 'TX_QR_444', userId: 'USR_123', qrData: 'lynkid://pay', status: 'pending', amount: 500, type: 'qr_payment' });
    if (url.includes('/qr-payment/verify')) return send(200, { transactionId: 'TX_QR_444', status: 'completed' });
    if (url.includes('/qr-payment/merchants')) return send(200, { merchants: [{ id: 'MCH_001', name: 'Gemini Coffee' }] });

    // --- 6. GIFT CARDS ---
    if (url.includes('/gift-cards/purchase')) return send(201, { transactionId: 'TX_GC_555', userId: 'USR_123', cardId: 'GC_555', amount: payload.amount || 1000, status: 'completed', type: 'gift_card' });
    if (url.includes('/gift-cards/send')) return send(200, { status: 'sent' });
    if (url.includes('/gift-cards/') && url.includes('/balance')) return send(200, { balance: 50000 });

    // --- 7. PARTNERS ---
    if (url.includes('/api/v1/partners')) return send(200, { partners: [{ id: 'LOTUS', name: 'Lotusmiles' }] });

    // --- 8. INTERNAL ---
    if (url.includes('/api/internal/health')) return send(200, { status: 'UP' });

    send(404, { error: `Endpoint ${url} not mocked yet` });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Final Mock Server running at http://localhost:${PORT}`);
});
