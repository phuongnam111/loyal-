# 🧠 Automation Mindset – Xây Dựng Framework Testing cho Sản Phẩm Loyalty


---

## 1. 🏗️ Tư Duy Kiến Trúc Framework

### 1.1. Test Pyramid (Kim Tự Tháp Kiểm Thử)

```
        /  E2E  \           ← Ít nhất: 1-3 tests full journey
       /----------\
      / Integration \       ← Vừa phải: 5-15 tests liên kết module
     /--------------\
    /   Functional    \     ← Nhiều nhất: 30-100+ test cases/module
   /------------------\
  /    Unit (Service)    \  ← Code coverage cho service wrappers
 /________________________\
```

**Nguyên tắc:**
- **70% Functional tests** – Test từng API endpoint riêng lẻ (happy path + edge cases)
- **20% Integration tests** – Test luồng liên module (ví dụ: earn → redeem → balance)
- **10% E2E tests** – Test toàn bộ user journey (tốn chi phí nhất, chạy ít nhất)

### 1.2. Separation of Concerns (Tách biệt trách nhiệm)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   TEST CASE  │────▶│   SERVICE    │────▶│  BASE CLIENT│
│ (what to test)│     │ (how to call) │    │ (how to send) │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                     │
  Business logic      API wrapper          HTTP transport
  & assertions       per domain          auth, retry, log
```

**Lợi ích:**
- Test case chỉ cần biết *business logic*, không quan tâm HTTP details
- Service thay đổi endpoint → chỉ sửa 1 file, không ảnh hưởng test
- Base client thay đổi auth strategy → không ảnh hưởng service hay test

---

## 2. 📐 Nguyên Tắc Thiết Kế

### 2.1. Naming Convention

| Layer           | Quy ước              | Ví dụ |
|-------|---------|-------|
| Service file | `{domain}.service.js`   | `voucher.service.js` |
| Endpoint file | `{domain}.endpoints.js` | `voucher.endpoints.js` |
| Test file | `{feature}.test.js`         | `voucher-claim.test.js` |
| Fixture file | `{entity}.fixture.js`     | `user.fixture.js` |
| Generator file | `{entity}.generator.js` | `user.generator.js` |
| Test case ID | `TC_{MODULE}_{NNN}`       | `TC_EARN_001` |

### 2.2. Test Case Design

Mỗi test case nên theo cấu trúc **AAA** (Arrange - Act - Assert):

```javascript
async function test_something() {
  const testName = 'TC_XXX_001 - Mô tả ngắn gọn';
  try {
    // ARRANGE: Chuẩn bị dữ liệu
    const user = presetUsers.primeUser();
    
    // ACT: Thực hiện hành động
    const response = await service.doSomething(user.userId, ...);
    
    // ASSERT: Kiểm tra kết quả
    ResponseValidator.validateStatus(response, 200);
    const data = await ResponseValidator.parseJson(response);
    ResponseValidator.validateSchema(data, schema);
    
    reporter.record(testName, { passed: true });
  } catch (error) {
    reporter.record(testName, { passed: false, error: error.message });
  }
}
```

### 2.3. Test Data Strategy

```
                 ┌── Generators ──── Random, valid data (user.generator.js)
                 │
Test Data ───────┼── Fixtures ────── Preset scenarios (user.fixture.js)
                 │
                 └── Schemas ─────── Validation rules (users.json)
```

- **Generators**: Tạo dữ liệu ngẫu nhiên nhưng hợp lệ → dùng cho volume testing
- **Fixtures**: Dữ liệu cố định cho scenarios cụ thể (user 0 balance, user sắp upgrade)
- **Schemas**: JSON Schema để validate response từ API

---

## 3. 🎯 Chiến Lược Triển Khai Cho Sản Phẩm Loyalty

### 3.1. Phân Tích Sản Phẩm LynkiD → Test Scope

| Domain | Business Feature | API Scope | Priority |
|--------|-----------------|-----------|----------|
| **Points** | Tích điểm, đổi điểm, xem số dư | Earn, Redeem, Balance, History | 🔴 Critical |
| **Vouchers** | Đổi voucher, kho ưu đãi 1000+ brands | Catalog, Claim, Use, Validate | 🔴 Critical |
| **Tiers** | Hạng Standard/Prime/Diamond | List, UserTier, Benefits, Progress | 🟡 High |
| **QR Payment** | Quét QR thanh toán bằng điểm | Generate, Verify, Status | 🟡 High |
| **Gift Cards** | Mua/gửi/nhận gift card | Purchase, Send, Redeem | 🟢 Medium |
| **Partners** | Liên kết Lotusmiles, SkyJoy | Transfer, Link/Unlink, Rates | 🟢 Medium |
| **Auth** | Đăng nhập, token management | Login, Refresh, Logout | 🔴 Critical |

### 3.2. Test Scenarios (Ưu Tiên Cho Loyalty)

**🔴 Must-Have Tests (Sprint 1):**
1. Earn points → verify balance tăng
2. Redeem points → verify balance giảm + voucher được cấp
3. Redeem khi không đủ điểm → reject
4. Claim voucher hết hạn / hết hàng → reject
5. Smoke test tất cả endpoints

**🟡 Should-Have Tests (Sprint 2):**
6. Earn points → tier upgrade tự động khi đạt ngưỡng
7. QR Payment → generate → verify → status
8. Concurrent redeem (2 yêu cầu đổi cùng lúc)
9. Point expiry validation

**🟢 Nice-to-Have Tests (Sprint 3+):**
10. Partner point transfer (bidirectional)
11. Gift card full flow (purchase → send → redeem)
12. Performance test: 100 concurrent earn requests
13. Contract testing (PACT) giữa LynkiD và partners

### 3.3. Execution Strategy

```
CI Pipeline Order:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Install    │───▶│   Smoke     │───▶│  API Tests  │───▶│   Report    │
│ (npm ci)     │    │ (fast-fail) │    │ (full suite)│    │ (artifacts) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                      < 1 min            5-15 min            < 1 min
```

- **Smoke trước, deep tests sau** – nếu health check fail → dừng ngay, không tốn thời gian
- **Parallel execution** – các module độc lập có thể chạy song song
- **Fast feedback** – dev nhận kết quả trong < 15 phút

---

## 4. 🛠️ Best Practices

### 4.1. Không Hardcode

```javascript
// ❌ BAD
const response = await fetch('https://api-dev.loyalty.com/api/v1/points/earn');

// ✅ GOOD
const response = await earnService.earn(user.userId, 1000, 'banking');
// URL, headers, auth, retry → tự động xử lý bởi base-client
```

### 4.2. Mỗi Test Phải Độc Lập

```javascript
// ❌ BAD – Test B phụ thuộc kết quả Test A
let sharedUserId;
test_A() { sharedUserId = createUser(); }
test_B() { earnPoints(sharedUserId); }  // Fail nếu A fail

// ✅ GOOD – Mỗi test tự tạo dữ liệu riêng
test_B() {
  const user = presetUsers.primeUser();  // Fixture riêng
  earnPoints(user.userId);
}
```

### 4.3. Error Handling Rõ Ràng

```javascript
// ❌ BAD – Swallow error, không biết fail ở đâu
try { await doSomething(); } catch(e) { /* silent */ }

// ✅ GOOD – Log chi tiết + record result
try {
  await doSomething();
  reporter.record(testName, { passed: true });
  logger.info(`✅ PASSED: ${testName}`);
} catch (error) {
  reporter.record(testName, { passed: false, error: error.message });
  logger.error(`❌ FAILED: ${testName} - ${error.message}`);
}
```

### 4.4. Cleanup After Test

```javascript
// Đăng ký cleanup handler trước khi chạy test
const cleanupManager = new CleanupManager();
cleanupManager.register(async () => {
  await deleteTestUser(userId);
  await reverseTransaction(txnId);
});

// Sau test suite
await cleanupManager.run();
```

---

## 5. 📈 Lộ Trình Phát Triển

### Phase 1: Foundation (Tuần 1-2) ✅
- [x] Core framework (base-client, config, auth, retry, logger)
- [x] Services layer cho tất cả domain
- [x] Fixtures & test data generators
- [x] Sample test cases (functional/integration/e2e/smoke)

### Phase 2: Production-Ready (Tuần 3-4)
- [ ] Kết nối API thật (thay URL/credentials thực)
- [ ] Tích hợp Allure Report thay cho custom reporter
- [ ] Thêm CI/CD variables cho staging/production
- [ ] Thêm authentication flow thực (login → get token)
- [ ] Thêm test data cleanup tự động

### Phase 3: Scale (Tuần 5-8)
- [ ] Performance testing với k6 hoặc Artillery
- [ ] Contract testing (PACT) cho partner APIs
- [ ] Parallel test execution
- [ ] Slack/Teams notification khi test fail
- [ ] Test coverage tracking & dashboards

### Phase 4: Maintenance (Ongoing)
- [ ] Weekly review test results
- [ ] Cập nhật tests khi API thay đổi
- [ ] Thêm regression tests cho bugs đã fix
- [ ] Tự động hóa data seeding cho môi trường test

---

## 7. 🌐 Quản Lý 900+ Endpoints ở Quy Mô Lớn

Khi hệ thống mở rộng lên ~900 endpoints (internal + partner + public), **1 file `registry.json` flat sẽ KHÔNG scale**. Cần chiến lược phân tầng.

### 7.1. Phân Tách Endpoint theo Domain + Scope

```
config/endpoints/
├── _index.js                  # Auto-loader, merge tất cả file
├── internal/                  # ~200 APIs nội bộ
│   ├── points.endpoints.json
│   ├── vouchers.endpoints.json
│   ├── tiers.endpoints.json
│   ├── users.endpoints.json
│   ├── notifications.endpoints.json
│   ├── admin.endpoints.json
│   └── ...
├── partner/                   # ~300 APIs gọi sang đối tác
│   ├── shopee.endpoints.json
│   ├── lazada.endpoints.json
│   ├── grab.endpoints.json
│   ├── lotusmiles.endpoints.json
│   ├── skyjoy.endpoints.json
│   ├── payment-gateway.endpoints.json
│   └── ...
├── public/                    # ~200 APIs public (mobile app, web)
│   ├── auth.endpoints.json
│   ├── catalog.endpoints.json
│   ├── user-profile.endpoints.json
│   └── ...
└── webhook/                   # ~200 APIs callback/webhook
    ├── payment-callback.endpoints.json
    ├── partner-sync.endpoints.json
    └── ...
```

**Nguyên tắc: Mỗi file ≤ 30-50 endpoints.** Khi vượt quá → tách nhỏ hơn.

### 7.2. Endpoint Metadata (Tagging System)

Mỗi endpoint cần metadata phong phú hơn chỉ URL. Đây là chìa khóa để quản lý thông minh:

```json
{
  "id": "POINTS_EARN_001",
  "path": "/api/v1/points/earn",
  "method": "POST",
  "scope": "internal",
  "auth": "bearer",
  "priority": "critical",
  "domain": "points",
  "subdomain": "earn",
  "owner": "team-points",
  "tags": ["transaction", "balance-affecting", "tier-affecting"],
  "dependencies": ["AUTH_LOGIN_001"],
  "dependents": ["POINTS_BALANCE_001", "TIERS_PROGRESS_001"],
  "rateLimit": { "rpm": 100 },
  "timeout": 5000,
  "version": "v1",
  "deprecated": false
}
```

**Các tag quan trọng:**

| Tag | Ý nghĩa | Ví dụ |
|-----|---------|-------|
| `scope` | Loại API | `internal`, `partner`, `public`, `webhook` |
| `auth` | Phương thức xác thực | `bearer`, `api-key`, `hmac`, `none` |
| `priority` | Mức ưu tiên test | `critical`, `high`, `medium`, `low` |
| `tags` | Nhãn hành vi | `balance-affecting`, `tier-affecting`, `notification-trigger` |
| `dependencies` | Endpoint phải gọi trước | `["AUTH_LOGIN_001"]` |
| `dependents` | Endpoint bị ảnh hưởng | `["POINTS_BALANCE_001"]` |
| `owner` | Team chịu trách nhiệm | `team-points`, `team-partner` |

### 7.3. Endpoint Auto-Loader

```javascript
// config/endpoints/_index.js
const fs = require('fs');
const path = require('path');

function loadAllEndpoints(baseDir) {
  const registry = { internal: {}, partner: {}, public: {}, webhook: {} };
  const scopes = ['internal', 'partner', 'public', 'webhook'];

  for (const scope of scopes) {
    const scopeDir = path.join(baseDir, scope);
    if (!fs.existsSync(scopeDir)) continue;

    for (const file of fs.readdirSync(scopeDir)) {
      if (!file.endsWith('.json')) continue;
      const domain = file.replace('.endpoints.json', '');
      const data = JSON.parse(fs.readFileSync(path.join(scopeDir, file), 'utf-8'));
      registry[scope][domain] = data;
    }
  }
  return registry;
}

// Tìm endpoint theo ID
function findEndpointById(registry, id) {
  for (const scope of Object.values(registry)) {
    for (const domain of Object.values(scope)) {
      const endpoints = Array.isArray(domain) ? domain : domain.endpoints || [];
      const found = endpoints.find(e => e.id === id);
      if (found) return found;
    }
  }
  return null;
}

// Tìm tất cả endpoints theo tag
function findEndpointsByTag(registry, tag) {
  const results = [];
  for (const scope of Object.values(registry)) {
    for (const domain of Object.values(scope)) {
      const endpoints = Array.isArray(domain) ? domain : domain.endpoints || [];
      results.push(...endpoints.filter(e => e.tags?.includes(tag)));
    }
  }
  return results;
}

module.exports = { loadAllEndpoints, findEndpointById, findEndpointsByTag };
```

---

## 8. 🔗 Dependency Graph – Khi Endpoints Liên Quan Nhau

Đây là **yếu tố quan trọng nhất** khi quản lý hệ thống lớn. Endpoints KHÔNG độc lập – chúng tạo thành **đồ thị phụ thuộc (DAG)**.

### 8.1. Dependency Map

```
                           ┌─────────────┐
                           │  AUTH_LOGIN │  ← Gốc: mọi thứ bắt đầu từ đây
                           └──────┬──────┘
                                  │
              ┌───────────┬───────┴───────┬────────────┐
              ▼           ▼               ▼            ▼
        ┌──────────┐ ┌──────────┐  ┌───────────┐ ┌──────────┐
        │  EARN    │ │ VOUCHER  │  │  PARTNER  │ │   USER   │
        │ POINTS   │ │ CATALOG  │  │   LIST    │ │ PROFILE  │
        └────┬─────┘ └────┬─────┘  └─────┬─────┘ └──────────┘
             │            │              │
        ┌────┴────┐  ┌────┴────┐    ┌────┴────┐
        ▼         ▼  ▼         ▼    ▼         ▼
   ┌─────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
   │ BALANCE │ │ REDEEM │ │ CLAIM  │ │ TRANSFER │
   └────┬────┘ └────┬───┘ └────┬───┘ │  POINTS  │
        │           │          │     └──────────┘
        └─────┬─────┘          │
              ▼                ▼
        ┌───────────┐   ┌──────────┐
        │   TIER    │   │  USE     │
        │ PROGRESS  │   │ VOUCHER  │
        └───────────┘   └──────────┘
```

### 8.2. Code Mô Hình Hóa Dependency Graph

```javascript
// src/core/dependency-graph.js

class EndpointDependencyGraph {
  constructor() {
    this.nodes = new Map();    // endpointId → endpoint metadata
    this.edges = new Map();    // endpointId → Set<dependentId>
    this.reverseEdges = new Map(); // endpointId → Set<dependencyId>
  }

  /** Đăng ký một endpoint */
  register(endpoint) {
    this.nodes.set(endpoint.id, endpoint);
    if (!this.edges.has(endpoint.id)) this.edges.set(endpoint.id, new Set());
    if (!this.reverseEdges.has(endpoint.id)) this.reverseEdges.set(endpoint.id, new Set());

    // Thêm dependencies (upstream)
    for (const depId of (endpoint.dependencies || [])) {
      if (!this.edges.has(depId)) this.edges.set(depId, new Set());
      this.edges.get(depId).add(endpoint.id);
      this.reverseEdges.get(endpoint.id).add(depId);
    }
  }

  /** Lấy tất cả endpoints bị ảnh hưởng khi endpoint X thay đổi (downstream) */
  getImpacted(endpointId) {
    const impacted = new Set();
    const queue = [endpointId];
    while (queue.length > 0) {
      const current = queue.shift();
      for (const dep of (this.edges.get(current) || [])) {
        if (!impacted.has(dep)) {
          impacted.add(dep);
          queue.push(dep);
        }
      }
    }
    return [...impacted];
  }

  /** Lấy tất cả endpoint phải chạy TRƯỚC endpoint X (upstream) */
  getPrerequisites(endpointId) {
    const prerequisites = new Set();
    const queue = [endpointId];
    while (queue.length > 0) {
      const current = queue.shift();
      for (const dep of (this.reverseEdges.get(current) || [])) {
        if (!prerequisites.has(dep)) {
          prerequisites.add(dep);
          queue.push(dep);
        }
      }
    }
    return [...prerequisites];
  }

  /** Sắp xếp thứ tự chạy test (Topological Sort) */
  getExecutionOrder(endpointIds) {
    const visited = new Set();
    const order = [];

    const visit = (id) => {
      if (visited.has(id)) return;
      visited.add(id);
      for (const dep of (this.reverseEdges.get(id) || [])) {
        if (endpointIds.includes(dep)) visit(dep);
      }
      order.push(id);
    };

    for (const id of endpointIds) visit(id);
    return order;
  }

  /** Tìm các nhóm endpoint ĐỘC LẬP (có thể chạy song song) */
  getIndependentGroups(endpointIds) {
    const groups = [];
    const assigned = new Set();

    for (const id of endpointIds) {
      if (assigned.has(id)) continue;
      // Tìm connected component
      const group = new Set();
      const queue = [id];
      while (queue.length > 0) {
        const current = queue.shift();
        if (group.has(current) || !endpointIds.includes(current)) continue;
        group.add(current);
        assigned.add(current);
        for (const dep of (this.edges.get(current) || [])) queue.push(dep);
        for (const dep of (this.reverseEdges.get(current) || [])) queue.push(dep);
      }
      groups.push([...group]);
    }
    return groups;
  }
}

module.exports = { EndpointDependencyGraph };
```

### 8.3. Ví Dụ Thực Tế: Impact Analysis

```javascript
const graph = new EndpointDependencyGraph();

// Đăng ký các endpoint với dependencies
graph.register({ id: 'AUTH_LOGIN',     dependencies: [] });
graph.register({ id: 'POINTS_EARN',   dependencies: ['AUTH_LOGIN'] });
graph.register({ id: 'POINTS_BALANCE',dependencies: ['AUTH_LOGIN'] });
graph.register({ id: 'POINTS_REDEEM', dependencies: ['POINTS_BALANCE'] });
graph.register({ id: 'TIER_PROGRESS', dependencies: ['POINTS_BALANCE'] });
graph.register({ id: 'VOUCHER_CLAIM', dependencies: ['POINTS_BALANCE'] });
graph.register({ id: 'VOUCHER_USE',   dependencies: ['VOUCHER_CLAIM'] });

// ❓ "API POINTS_EARN thay đổi, cần test lại những gì?"
graph.getImpacted('POINTS_EARN');
// → ['POINTS_BALANCE', 'POINTS_REDEEM', 'TIER_PROGRESS', 'VOUCHER_CLAIM', 'VOUCHER_USE']
// → 5 endpoints bị ảnh hưởng!

// ❓ "Muốn test VOUCHER_USE, phải chạy trước những gì?"
graph.getPrerequisites('VOUCHER_USE');
// → ['VOUCHER_CLAIM', 'POINTS_BALANCE', 'AUTH_LOGIN']

// ❓ "Sắp xếp thứ tự chạy test cho nhóm endpoints?"
graph.getExecutionOrder(['VOUCHER_USE', 'POINTS_EARN', 'TIER_PROGRESS']);
// → ['POINTS_EARN', 'TIER_PROGRESS', 'VOUCHER_USE'] (respect dependencies)
```

---

## 9. ⚡ Tối Ưu Thời Gian Chạy Test – Tránh Trùng Lặp

### 9.1. Ba Chế Độ Chạy (Execution Modes)

```
┌──────────────────────────────────────────────────────────┐
│                   EXECUTION MODES                        │
├──────────────┬────────────────┬───────────────────────────┤
│  🟢 QUICK    │  🟡 SMART     │  🔴 FULL                 │
│  changed-only│  changed +     │  all endpoints           │
│              │  impacted      │                          │
│  ~2 phút    │  ~8 phút      │  ~45 phút (900 EPs)     │
│  PR check   │  staging       │  nightly / release       │
└──────────────┴────────────────┴───────────────────────────┘
```

| Mode | Khi nào dùng | Chạy gì |
|------|-------------|---------|
| **QUICK** | Mỗi PR/commit | Chỉ test endpoint bị thay đổi trong code diff |
| **SMART** | Merge vào develop/staging | Endpoint thay đổi + tất cả downstream impacted |
| **FULL** | Nightly build / trước release | Toàn bộ 900 endpoints |

### 9.2. Smart Test Selection (Chọn Test Thông Minh)

```javascript
// src/core/smart-runner.js

class SmartTestRunner {
  constructor(graph, testRegistry) {
    this.graph = graph;           // EndpointDependencyGraph
    this.testRegistry = testRegistry; // Map<endpointId, testFiles[]>
  }

  /**
   * Xác định danh sách test cần chạy dựa trên endpoints bị thay đổi
   * @param {string[]} changedEndpoints - IDs of endpoints changed in this PR
   * @param {string} mode - 'quick' | 'smart' | 'full'
   */
  selectTests(changedEndpoints, mode = 'smart') {
    let targetEndpoints;

    switch (mode) {
      case 'quick':
        // Chỉ test chính xác endpoint bị thay đổi
        targetEndpoints = changedEndpoints;
        break;

      case 'smart':
        // Test endpoint thay đổi + TẤT CẢ bị ảnh hưởng (downstream)
        const impacted = new Set(changedEndpoints);
        for (const ep of changedEndpoints) {
          for (const dep of this.graph.getImpacted(ep)) {
            impacted.add(dep);
          }
        }
        targetEndpoints = [...impacted];
        break;

      case 'full':
        targetEndpoints = [...this.graph.nodes.keys()];
        break;
    }

    // Sắp xếp theo dependency order
    const ordered = this.graph.getExecutionOrder(targetEndpoints);

    // Map sang test files
    const testFiles = [];
    const seen = new Set();
    for (const epId of ordered) {
      const files = this.testRegistry.get(epId) || [];
      for (const f of files) {
        if (!seen.has(f)) {
          seen.add(f);
          testFiles.push(f);
        }
      }
    }

    return { targetEndpoints: ordered, testFiles, mode };
  }
}

module.exports = { SmartTestRunner };
```

### 9.3. Parallel Execution (Chạy Song Song Nhóm Độc Lập)

```
Với 900 endpoints, chạy tuần tự = 45 phút. Song song = 8-10 phút.

Thread 1: AUTH → POINTS chain     ████████░░░░░░
Thread 2: AUTH → VOUCHER chain    ████████████░░
Thread 3: PARTNER chain           ██████░░░░░░░░
Thread 4: NOTIFICATION chain      ████░░░░░░░░░░
Thread 5: ADMIN chain             ██████████░░░░
                                  ──────────────▶ Time
```

```javascript
async function runParallel(graph, allEndpoints) {
  // Tìm các nhóm ĐỘC LẬP (không có dependency chéo)
  const groups = graph.getIndependentGroups(allEndpoints);

  console.log(`Found ${groups.length} independent groups, running in parallel...`);

  // Chạy mỗi group song song, nhưng TRONG group thì tuần tự (respect dependency)
  const results = await Promise.all(
    groups.map(async (group) => {
      const ordered = graph.getExecutionOrder(group);
      const groupResults = [];
      for (const epId of ordered) {
        const result = await runTestsForEndpoint(epId);
        groupResults.push(result);
        // Nếu upstream fail → skip downstream
        if (!result.passed) {
          console.log(`⚠️ ${epId} failed, skipping dependents`);
          break;
        }
      }
      return groupResults;
    })
  );

  return results.flat();
}
```

### 9.4. Skip Downstream On Failure (Bỏ Qua Khi Upstream Fail)

```
AUTH_LOGIN ─── FAIL ❌
    │
    ├── POINTS_EARN ────── SKIPPED ⏭️  (không cần chạy, vì auth fail)
    │      │
    │      └── POINTS_BALANCE ── SKIPPED ⏭️
    │             │
    │             └── TIER_PROGRESS ── SKIPPED ⏭️
    │
    └── VOUCHER_CATALOG ── SKIPPED ⏭️
```

**Lợi ích**: Nếu AUTH fail → skip 50+ dependent tests → tiết kiệm 20 phút.

### 9.5. Tránh Trùng Lặp Test Giữa Các Level

```
❌ BÀI TOÁN TRÙNG LẶP:
   Functional test "Earn Points" → gọi POST /points/earn
   Integration test "Earn→Redeem" → CŨNG gọi POST /points/earn
   E2E test "Full Journey"       → LẠI gọi POST /points/earn
   → 3 lần test cùng 1 endpoint!

✅ GIẢI PHÁP: Phân vai CLEAR cho mỗi level:

┌─────────────────────────────────────────────────────────────────┐
│ Level        │ Test cái gì              │ KHÔNG test cái gì     │
├──────────────┼──────────────────────────┼───────────────────────┤
│ Functional   │ Mỗi endpoint riêng lẻ:   │ Không test luồng liên │
│              │ - Input validation       │ module. Không test    │
│              │ - Response schema        │ business flow.        │
│              │ - Error codes            │                       │
│              │ - Edge cases             │                       │
├──────────────┼──────────────────────────┼───────────────────────┤
│ Integration  │ Luồng 2-3 endpoints:     │ Không re-test input   │
│              │ - Data flows correctly   │ validation. Không test│
│              │ - Side effects work      │ error codes.          │
│              │ - State transitions      │                       │
├──────────────┼──────────────────────────┼───────────────────────┤
│ E2E          │ Business journey:        │ Không test edge cases.│
│              │ - Happy path ONLY        │ Không test schema.    │
│              │ - Real user scenario     │ Chỉ verify outcome.   │
│              │ - Cross-domain flow      │                       │
└──────────────┴──────────────────────────┴───────────────────────┘
```

### 9.6. Test Registry (Ánh Xạ Endpoint → Test Files)

```json
{
  "POINTS_EARN_001": {
    "functional": ["tests/api/functional/points/earn-points.test.js"],
    "integration": ["tests/api/integration/earn-and-redeem.test.js"],
    "e2e": ["tests/api/e2e/full-loyalty-journey.test.js"],
    "smoke": ["tests/smoke/health-check.test.js"]
  },
  "VOUCHER_CLAIM_001": {
    "functional": ["tests/api/functional/vouchers/voucher-claim.test.js"],
    "integration": [],
    "e2e": ["tests/api/e2e/full-loyalty-journey.test.js"],
    "smoke": ["tests/smoke/health-check.test.js"]
  }
}
```

Khi POINTS_EARN thay đổi → Smart Runner tra bảng → chọn đúng 3 file test cần chạy.

### 9.7. Tổng Kết Chiến Lược 900+ Endpoints

```
                 ┌─────────────────────────────┐
                 │  PR pushed / Code changed    │
                 └──────────┬──────────────────┘
                            │
                 ┌──────────▼──────────────────┐
                 │  Detect changed endpoints    │  ← git diff + file mapping
                 └──────────┬──────────────────┘
                            │
              ┌─────────────▼─────────────────┐
              │  Build dependency graph (DAG)  │  ← từ endpoint metadata
              └─────────────┬─────────────────┘
                            │
              ┌─────────────▼─────────────────┐
              │  Select mode: QUICK / SMART   │  ← dựa vào context (PR/staging)
              └─────────────┬─────────────────┘
                            │
              ┌─────────────▼──────────────────┐
              │  Calculate impacted endpoints   │  ← downstream traversal
              └─────────────┬──────────────────┘
                            │
              ┌─────────────▼──────────────────┐
              │  Group into independent chains  │  ← for parallel execution
              └─────────────┬──────────────────┘
                            │
              ┌─────────────▼──────────────────┐
              │  Execute parallel + skip on fail│  ← save time
              └─────────────┬──────────────────┘
                            │
              ┌─────────────▼──────────────────┐
              │  Report: tested / skipped /     │
              │  impacted but not tested        │
              └────────────────────────────────┘
```

---

## 10. 💡 Tổng Kết Mindset

> **"Automation testing không phải viết code, mà là xây dựng hệ thống."**

1. **Think in layers** – Tách biệt HTTP ↔ Service ↔ Test
2. **Think in data** – Có chiến lược rõ ràng cho test data (generate / fixture / cleanup)
3. **Think in priority** – Test critical paths trước, edge cases sau, performance cuối
4. **Think in CI/CD** – Mọi test phải chạy được tự động, không manual intervention
5. **Think in maintenance** – Code dễ đọc, dễ mở rộng, dễ debug khi fail
6. **Think in business** – Hiểu sản phẩm (LynkiD) trước, viết test sau
7. **Think in dependencies** – Hiểu endpoint nào ảnh hưởng endpoint nào → test thông minh
8. **Think in scale** – 10 endpoints khác 900 endpoints, thiết kế cho tương lai

> 🎯 **Mục tiêu cuối cùng**: Khi dev push code → CI tự chạy → 10 phút có kết quả → tự tin deploy.

