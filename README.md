# Loyalty Automation Framework

> Bao gồm: Points, Vouchers, Tiers, QR Payment, Gift Cards, Partner Integrations.

## 📁 Cấu trúc dự án

```
loyalty-automation/
├── config/                           # Cấu hình & dữ liệu test
│   ├── endpoints/
│   │   └── registry.json             # Bản đồ tất cả API endpoints
│   ├── environments/
│   │   ├── base.json                 # Config chung (timeout, retry, auth, points rules)
│   │   ├── dev.json                  # Config môi trường Development
│   │   ├── staging.json              # Config môi trường Staging
│   │   └── prod.json                 # Config môi trường Production
│   └── test-data/
│       ├── generators/               # Functions sinh dữ liệu test tự động
│       │   ├── user.generator.js
│       │   └── transaction.generator.js
│       └── schemas/                  # JSON Schema để validate response
│           ├── users.json
│           ├── transactions.json
│           └── vouchers.json
│
├── src/                              # Source code framework
│   ├── core/                         # Module lõi (tái sử dụng cao)
│   │   ├── api-client/
│   │   │   ├── base-client.js        # HTTP client (auth, interceptors, retry, log)
│   │   │   ├── auth-handler.js       # Quản lý token (Bearer, API Key, OAuth2)
│   │   │   ├── response-validator.js # Validate status, JSON schema, assertions
│   │   │   └── retry-handler.js      # Retry logic với exponential backoff
│   │   ├── config/
│   │   │   └── config-loader.js      # Load & merge config (base + env + .env)
│   │   ├── test-data-manager/
│   │   │   ├── data-factory.js       # Factory pattern tạo dữ liệu
│   │   │   ├── data-pool.js          # Pool quản lý lifecycle dữ liệu
│   │   │   └── cleanup-manager.js    # Dọn dẹp sau test
│   │   └── utilities/
│   │       ├── helpers.js            # Tiện ích: sleep, pick, omit, randomId
│   │       ├── logger.js             # Logger theo level (debug/info/warn/error)
│   │       └── reporter.js           # Ghi nhận kết quả test
│   │
│   ├── services/                     # Domain services (business API wrappers)
│   │   ├── points/                   # Tích điểm & Đổi điểm
│   │   │   ├── earn-points.service.js
│   │   │   ├── redeem-points.service.js
│   │   │   └── points.endpoints.js
│   │   ├── vouchers/                 # Voucher (claim, use, validate)
│   │   │   ├── voucher.service.js
│   │   │   └── voucher.endpoints.js
│   │   ├── loyalty-tiers/            # Hạng thành viên (Standard/Prime/Diamond)
│   │   │   ├── tier.service.js
│   │   │   └── tier.endpoints.js
│   │   ├── qr-payment/              # Thanh toán QR bằng điểm
│   │   │   ├── qr-payment.service.js
│   │   │   └── qr-payment.endpoints.js
│   │   ├── gift-cards/              # Gift card (mua, gửi, nhận)
│   │   │   ├── gift-card.service.js
│   │   │   └── gift-card.endpoints.js
│   │   └── partners/               # Đối tác (Lotusmiles, SkyJoy, Shopee...)
│   │       ├── partner.service.js
│   │       └── partner.endpoints.js
│   │
│   ├── fixtures/                    # Dữ liệu mẫu preset cho test
│   │   ├── users/
│   │   │   └── user.fixture.js      # Standard/Prime/Diamond/ZeroBalance users
│   │   ├── transactions/
│   │   │   └── transaction.fixture.js
│   │   └── products/
│   │       └── product.fixture.js   # Vouchers (Shopee, Grab, free, expired...)
│   │
│   └── integrations/                # Tích hợp bên thứ 3
│       ├── partners/
│       └── third-party/
│
├── tests/                           # Test cases
│   ├── run.js                       # Master runner (smoke → API)
│   ├── api/
│   │   ├── run.js                   # API test runner
│   │   ├── functional/              # Test chức năng từng module
│   │   │   ├── points/
│   │   │   │   ├── earn-points.test.js    # 6 test cases
│   │   │   │   └── redeem-points.test.js  # 5 test cases
│   │   │   ├── vouchers/
│   │   │   │   └── voucher-claim.test.js  # 5 test cases
│   │   │   ├── tiers/
│   │   │   │   └── tier-management.test.js # 4 test cases
│   │   │   ├── qr-payment/
│   │   │   │   └── qr-generate.test.js    # 4 test cases
│   │   │   └── gift-cards/
│   │   │       └── gift-card-flow.test.js  # 4 test cases
│   │   ├── integration/             # Test liên kết giữa các module
│   │   │   └── earn-and-redeem.test.js     # 2 test cases
│   │   ├── e2e/                     # Test toàn bộ hành trình user
│   │   │   └── full-loyalty-journey.test.js # 1 comprehensive journey
│   │   └── contract/               # Contract tests (PACT) - future
│   ├── smoke/
│   │   ├── run.js
│   │   └── health-check.test.js     # 6 endpoint health checks
│   └── performance/                 # Performance tests - future
│
├── reports/                         # Test reports (auto-generated)
├── .env.example                     # Mẫu biến môi trường
├── .gitlab-ci.yml                   # CI/CD pipeline
├── MINDSET.md                       # Tư duy & chiến lược automation
├── package.json
└── README.md
```

## 🚀 Bắt đầu nhanh

```bash
# 1. Clone và cài đặt
git clone <repo-url>
cd loyalty-automation
cp .env.example .env
# Sửa .env với URL và credentials thực

# 2. Chạy test
npm test                    # Chạy tất cả (smoke → API)
npm run test:smoke          # Chỉ smoke test (health check nhanh)
npm run test:api            # Chạy tất cả API tests
npm run test:e2e            # Chạy E2E test
npm run test:integration    # Chạy integration tests
npm run validate:config     # Kiểm tra config hợp lệ
```

## 🔧 Cấu hình môi trường

| Biến | Mô tả | Mặc định |
|------|--------|----------|
| `API_BASE_URL` | Base URL của API | `https://api-dev.loyalty.example.com` |
| `TEST_ENV` | Môi trường test (dev/staging/prod) | `dev` |
| `AUTH_USERNAME` | Username đăng nhập | - |
| `AUTH_PASSWORD` | Password | - |
| `API_KEY` | API Key | - |
| `LOG_LEVEL` | Mức log (debug/info/warn/error) | `info` |
| `RETRY_ATTEMPTS` | Số lần retry khi lỗi | `3` |

## 📊 Test Coverage

| Module | Functional | Integration | E2E | Smoke |
|--------|:----------:|:-----------:|:---:|:-----:|
| Points (Earn/Redeem) | 11 TCs | 2 TCs | ✅ | ✅ |
| Vouchers | 5 TCs | - | ✅ | ✅ |
| Tiers | 4 TCs | 1 TC | ✅ | ✅ |
| QR Payment | 4 TCs | - | ✅ | ✅ |
| Gift Cards | 4 TCs | - | ✅ | - |
| Partners | - | - | - | ✅ |

## 📖 Tham khảo thêm

- **[MINDSET.md](./MINDSET.md)** – Tư duy & chiến lược xây dựng automation testing
