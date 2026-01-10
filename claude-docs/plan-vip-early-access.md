# Implementation Plan: VIP Early Access

## Overview

Add VIP Early Access feature allowing manual whitelisting of users to access exclusive products before general availability. Products marked as VIP-only are completely invisible to non-VIP users (404 on direct URL access).

**Related Documents:**
- [Feature Spec](./feature-vip-early-access.md) - Business requirements
- [Tech Spec](./techspec-vip-early-access.md) - Technical decisions

---

## Phase 1: Database Schema

**File:** `apps/backend/prisma/schema.prisma`

```prisma
model User {
  // Add after isActive field:
  isVip     Boolean  @default(false) @map("is_vip")
}

model Product {
  // Add after isFeatured field:
  vipOnly   Boolean   @default(false) @map("vip_only")
  vipUntil  DateTime? @map("vip_until")

  // Add index:
  @@index([vipOnly, vipUntil])
}
```

**Command:** `npm run db:migrate -w apps/backend -- --name add_vip_fields`

---

## Phase 2: Backend - Core VIP Logic

### 2.1 Config Update
**File:** `apps/backend/src/config/index.ts`
- Add `vip.enabled` from `VIP_FEATURE_ENABLED` env var

### 2.2 VIP Guard Middleware (NEW)
**File:** `apps/backend/src/middleware/vip-guard.ts`
- Extend FastifyRequest with `isVip?: boolean`
- `vipStatusMiddleware` - checks user's VIP status (cached 5min)
- `isProductVipOnly(product)` - helper to check if product is currently VIP-restricted

### 2.3 VIP Filtering in Catalog
**File:** `apps/backend/src/modules/catalog/catalog.routes.ts`

Modify `GET /products` and `GET /products/:idOrSlug`:
- Add `vipStatusMiddleware` as preHandler after `optionalAuthGuard`
- Filter VIP products in WHERE clause:
  ```typescript
  // Non-VIP users: exclude products where vipOnly=true AND vipUntil > now
  ...(request.isVip ? {} : {
    OR: [
      { vipOnly: false },
      { vipUntil: { lte: new Date() } },
    ]
  })
  ```
- Return 404 (not 403) for VIP products accessed by non-VIP users

### 2.4 VIP-Aware Cache Keys
**File:** `apps/backend/src/utils/redis.ts`
- Add: `productListVip: (page, limit, isVip) => \`products:list:${page}:${limit}:vip:${isVip}\``
- Add: `userVipStatus: (userId) => \`vip:user:${userId}\``

### 2.5 Checkout VIP Verification
**File:** `apps/backend/src/modules/orders/orders.routes.ts`

In `POST /` (create order):
- Add `vipStatusMiddleware` as preHandler
- After fetching products, verify VIP access:
  ```typescript
  for (const product of products) {
    if (product.vipOnly && product.vipUntil > new Date() && !request.isVip) {
      throw new ForbiddenError(`Product "${product.name}" is VIP-only`);
    }
  }
  ```

---

## Phase 3: Backend - Admin API

### 3.1 VIP Routes Module (NEW)
**File:** `apps/backend/src/modules/vip/vip.routes.ts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vip/users` | List VIP users (paginated) |
| POST | `/api/vip/users/bulk` | Bulk set VIP status (textarea emails) |
| DELETE | `/api/vip/users/:id` | Remove VIP status |
| GET | `/api/vip/products` | List VIP products |
| PATCH | `/api/vip/products/:id` | Set product vipOnly/vipUntil |
| GET | `/api/vip/stats` | Dashboard stats |

All endpoints require `adminGuard`.

### 3.2 Register Routes
**File:** `apps/backend/src/server.ts`
- Import and register: `await app.register(vipRoutes, { prefix: "/api/vip" })`

---

## Phase 4: Admin App (NEW)

### 4.1 Create App
**Directory:** `apps/admin/`

```
apps/admin/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard with stats
│   │   ├── login/page.tsx        # Admin login
│   │   └── vip/
│   │       ├── users/page.tsx    # Whitelist management
│   │       └── products/page.tsx # VIP product management
│   ├── components/
│   │   ├── VipUserTable.tsx
│   │   ├── BulkEmailInput.tsx
│   │   └── VipProductTable.tsx
│   └── lib/
│       └── api.ts
├── package.json
├── next.config.js
├── tailwind.config.js
└── Dockerfile
```

### 4.2 Update Workspaces
**File:** `package.json` (root)
- Add `"apps/admin"` to workspaces array

---

## Phase 5: Infrastructure

### 5.1 Helm Chart (NEW)
**Directory:** `helm/admin/`
- Copy from `helm/frontend/` and modify
- Change ingress path to `/admin`
- Set `NEXT_PUBLIC_API_URL` env var

### 5.2 ArgoCD Application (NEW)
**File:** `argocd/applications/admin.yaml`

### 5.3 ECR Repository
- Create `ecommerce-demo/admin` via Terraform or manually

### 5.4 GitHub Actions (NEW)
**File:** `.github/workflows/admin-ci.yml`
- Copy from frontend-ci.yml and adapt

### 5.5 Environment Variables
**Files:** `helm/backend/values.yaml`, `helm/backend/values-demo.yaml`
- Add: `VIP_FEATURE_ENABLED: "true"`

---

## Phase 6: Testing

### 6.1 Unit Tests (NEW)
**File:** `apps/backend/tests/unit/vip-guard.test.ts`
- Test VIP status middleware
- Test `isProductVipOnly` helper
- Test VIP status caching

### 6.2 Integration Tests (NEW)
**File:** `apps/backend/tests/integration/vip.test.ts`

Test scenarios:
1. VIP user sees VIP products in listing
2. Non-VIP user does NOT see VIP products in listing
3. Non-VIP user gets 404 on VIP product URL
4. VIP products visible to all after vipUntil passes
5. Checkout blocks non-VIP user on VIP products
6. Admin can set user VIP status
7. Admin can set product VIP status
8. Cache invalidation works on VIP changes

### 6.3 Test Factories Update
**File:** `apps/backend/tests/utils/factories.ts`
- Add `createVipUser()` helper
- Add `createVipProduct()` helper

---

## Deployment Order

1. **Database Migration** - Apply schema changes (zero downtime, additive only)
2. **Backend Deploy (flag off)** - Deploy with `VIP_FEATURE_ENABLED=false`
3. **Enable Feature** - Set `VIP_FEATURE_ENABLED=true`
4. **Admin App Deploy** - Build, push, deploy admin app
5. **Verification** - Test VIP user flow, non-VIP invisibility, checkout blocking

---

## Verification Checklist

- [ ] VIP user can see VIP products in `/api/catalog/products`
- [ ] Non-VIP user does NOT see VIP products in listing
- [ ] Non-VIP user gets 404 on `/api/catalog/products/:vipProductSlug`
- [ ] VIP products appear in search for VIP users only
- [ ] Non-VIP checkout with VIP product returns 403
- [ ] VIP checkout with VIP product succeeds
- [ ] Admin can bulk-add VIP users via textarea
- [ ] Admin can set product as VIP with end date
- [ ] VIP product becomes public after vipUntil passes
- [ ] Feature flag `VIP_FEATURE_ENABLED=false` disables all filtering
- [ ] All tests pass

---

## Rollback

Set `VIP_FEATURE_ENABLED=false` - immediately disables all VIP filtering without data loss.

---

## Files Summary

| Action | File |
|--------|------|
| MODIFY | `apps/backend/prisma/schema.prisma` |
| MODIFY | `apps/backend/src/config/index.ts` |
| CREATE | `apps/backend/src/middleware/vip-guard.ts` |
| MODIFY | `apps/backend/src/modules/catalog/catalog.routes.ts` |
| MODIFY | `apps/backend/src/modules/search/search.routes.ts` |
| MODIFY | `apps/backend/src/modules/orders/orders.routes.ts` |
| MODIFY | `apps/backend/src/utils/redis.ts` |
| CREATE | `apps/backend/src/modules/vip/vip.routes.ts` |
| MODIFY | `apps/backend/src/server.ts` |
| CREATE | `apps/backend/tests/unit/vip-guard.test.ts` |
| CREATE | `apps/backend/tests/integration/vip.test.ts` |
| MODIFY | `apps/backend/tests/utils/factories.ts` |
| CREATE | `apps/admin/` (entire app) |
| CREATE | `helm/admin/` (entire chart) |
| CREATE | `argocd/applications/admin.yaml` |
| CREATE | `.github/workflows/admin-ci.yml` |
| MODIFY | `helm/backend/values.yaml` |
| MODIFY | `helm/backend/values-demo.yaml` |
| MODIFY | `package.json` (root) |

---

*Plan created: 2026-01-10*
*Status: Ready for Implementation*

## To Execute

In the next session, run:
```
Enter plan mode and execute the plan in claude-docs/plan-vip-early-access.md
```
