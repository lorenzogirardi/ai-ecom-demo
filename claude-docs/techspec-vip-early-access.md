# Technical Specification: VIP Early Access

## Feature Overview

A gated content system allowing specific products to be visible and purchasable only by whitelisted VIP customers until a scheduled end date. Products automatically become public after the VIP period expires.

**Related Documents:**
- [Feature Spec](./feature-vip-early-access.md) - Business requirements and user stories

---

## Technical Architecture

### Data Model Changes

#### User Table (Prisma Schema)
```prisma
model User {
  // ... existing fields
  isVip     Boolean   @default(false)  // NEW: VIP status flag
}
```

#### Product Table (Prisma Schema)
```prisma
model Product {
  // ... existing fields
  vipOnly   Boolean   @default(false)  // NEW: VIP restriction flag
  vipUntil  DateTime?                   // NEW: When VIP period ends (UTC)
}
```

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         EKS Cluster                              │
├─────────────────┬─────────────────┬─────────────────────────────┤
│    Frontend     │     Backend     │      Admin (NEW)            │
│    (Next.js)    │    (Fastify)    │      (Next.js)              │
│                 │                 │                              │
│  - No VIP logic │  - Prisma       │  - VIP whitelist mgmt       │
│  - Just renders │    middleware   │  - Product VIP toggle       │
│    what API     │  - VIP filtering│  - ADMIN role required      │
│    returns      │  - Cache keys   │                              │
└────────┬────────┴────────┬────────┴──────────────┬──────────────┘
         │                 │                        │
         │                 ▼                        │
         │        ┌────────────────┐               │
         │        │   PostgreSQL   │               │
         │        │                │               │
         │        │ User.isVip     │◄──────────────┘
         │        │ Product.vipOnly│
         │        │ Product.vipUntil│
         │        └────────────────┘
         │                 │
         │                 ▼
         │        ┌────────────────┐
         └───────►│     Redis      │
                  │                │
                  │ products:vip:true  │
                  │ products:vip:false │
                  └────────────────┘
```

---

## Implementation Details

### 1. Prisma Middleware (VIP Filtering)

**Location:** `apps/backend/src/utils/prisma.ts`

```typescript
// Pseudo-code for Prisma middleware
prisma.$use(async (params, next) => {
  if (params.model === 'Product' && ['findMany', 'findFirst', 'findUnique'].includes(params.action)) {
    const isVipUser = getVipStatusFromContext(); // from request context
    const now = new Date();

    // Add VIP filter to WHERE clause
    params.args.where = {
      ...params.args.where,
      OR: [
        { vipOnly: false },  // Non-VIP products always visible
        { vipOnly: true, vipUntil: { lte: now } },  // Expired VIP products
        ...(isVipUser ? [{ vipOnly: true, vipUntil: { gt: now } }] : [])  // Active VIP products for VIP users
      ]
    };
  }
  return next(params);
});
```

**Key Points:**
- Filter runs automatically on all Product queries
- Uses request context to determine VIP status
- Time comparison uses server UTC time
- Non-VIP users never see active VIP products

### 2. Request Context for VIP Status

**Location:** `apps/backend/src/middleware/vip-context.ts`

```typescript
// Fastify hook to set VIP context
fastify.addHook('preHandler', async (request) => {
  if (request.user) {
    request.isVipUser = request.user.isVip === true;
  } else {
    request.isVipUser = false;
  }
});
```

### 3. Cache Strategy

**Location:** `apps/backend/src/utils/redis-cache.ts`

**Cache Key Pattern:**
```
products:list:vip:{true|false}:category:{categoryId}:page:{pageNum}
products:search:vip:{true|false}:query:{searchQuery}
product:detail:{slug}  // No VIP suffix - filtered at query level
```

**TTL:** 5 minutes (allows vipUntil expiry to propagate naturally)

### 4. Checkout Verification

**Location:** `apps/backend/src/modules/orders/orders.routes.ts`

```typescript
// In create order handler
const orderItems = request.body.items;
const now = new Date();

for (const item of orderItems) {
  const product = await prisma.product.findUnique({ where: { id: item.productId } });

  if (product.vipOnly && product.vipUntil > now && !request.user.isVip) {
    throw new ForbiddenError(`Product ${product.name} is VIP-only`);
  }
}
```

### 5. Feature Flag

**Environment Variable:**
```
VIP_FEATURE_ENABLED=true
```

**Usage:**
```typescript
const VIP_ENABLED = process.env.VIP_FEATURE_ENABLED === 'true';

// In Prisma middleware
if (!VIP_ENABLED) {
  return next(params);  // Skip VIP filtering entirely
}
```

---

## Admin Application

### New App Structure

```
apps/admin/                    # NEW Next.js app
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Dashboard
│   │   ├── login/
│   │   │   └── page.tsx      # Admin login
│   │   └── vip/
│   │       ├── page.tsx      # VIP management dashboard
│   │       ├── users/
│   │       │   └── page.tsx  # Whitelist management
│   │       └── products/
│   │           └── page.tsx  # VIP product management
│   ├── components/
│   │   ├── VipUserList.tsx
│   │   ├── VipProductList.tsx
│   │   └── BulkEmailInput.tsx
│   └── lib/
│       └── api.ts            # Admin API client
├── Dockerfile
├── package.json
└── next.config.js
```

### Admin API Endpoints (Backend)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/vip/users` | List all VIP users | ADMIN |
| POST | `/admin/vip/users/bulk` | Bulk update VIP status | ADMIN |
| DELETE | `/admin/vip/users/:userId` | Remove VIP status | ADMIN |
| GET | `/admin/vip/products` | List VIP products | ADMIN |
| PATCH | `/admin/vip/products/:productId` | Update VIP settings | ADMIN |
| POST | `/admin/vip/products/bulk` | Bulk update products | ADMIN |

### Admin UI Wireframes

**VIP Users Page:**
```
┌────────────────────────────────────────────────────────────┐
│  VIP User Management                          [Add Users]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Paste emails (one per line or comma-separated):      │ │
│  │ ┌──────────────────────────────────────────────────┐ │ │
│  │ │ john@example.com                                 │ │ │
│  │ │ jane@example.com                                 │ │ │
│  │ │ vip@customer.com                                 │ │ │
│  │ └──────────────────────────────────────────────────┘ │ │
│  │                                    [Add as VIP]      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Current VIP Users (3)                                     │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ☑ john@example.com          John Doe      [Remove]   │ │
│  │ ☑ jane@example.com          Jane Smith    [Remove]   │ │
│  │ ☑ vip@customer.com          VIP Customer  [Remove]   │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

**VIP Products Page:**
```
┌────────────────────────────────────────────────────────────┐
│  VIP Product Management                                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Active VIP Products (2)                                   │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Product              VIP Until           Actions      │ │
│  │ ──────────────────────────────────────────────────── │ │
│  │ SNBN Jacket          2026-01-15 18:00    [Edit][End] │ │
│  │ SNBN Sneakers        2026-01-15 18:00    [Edit][End] │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Add Products to VIP                                       │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Select products:  [Dropdown multi-select]            │ │
│  │ VIP until:        [2026-01-15] [18:00] UTC           │ │
│  │                                    [Make VIP]        │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## Deployment

### Helm Chart (New)

```
helm/admin/
├── Chart.yaml
├── values.yaml
├── values-demo.yaml
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    ├── ingress.yaml
    └── serviceaccount.yaml
```

### ArgoCD Application (New)

```yaml
# argocd/applications/admin.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: admin
  namespace: argocd
spec:
  project: ecommerce
  source:
    repoURL: https://github.com/lorenzogirardi/ai-ecom-demo
    targetRevision: main
    path: helm/admin
    helm:
      valueFiles:
        - values-demo.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: ecommerce
  syncPolicy:
    syncOptions:
      - CreateNamespace=true
```

### Infrastructure Changes

1. **ECR Repository:** `ecommerce-demo/admin`
2. **GitHub Actions:** New `admin-ci.yml` workflow
3. **ALB Ingress:** Route `/admin/*` to admin service
4. **Network Policy:** Allow traffic from ALB to admin pods

---

## Security Considerations

### Authentication & Authorization
- Admin app requires login with ADMIN role
- Same JWT system as main frontend
- All admin API endpoints require ADMIN role middleware

### Data Protection
- VIP filtering happens server-side (Prisma middleware)
- No VIP product data exposed to non-VIP API responses
- Checkout re-verifies VIP status before order creation

### Audit Trail (Nice-to-Have)
- Log VIP status changes (who, when, which users)
- Log product VIP settings changes

---

## Testing Strategy

### Unit Tests
| Test | Location | Coverage |
|------|----------|----------|
| VIP Prisma middleware | `tests/unit/vip-middleware.test.ts` | Filter logic, edge cases |
| VIP context hook | `tests/unit/vip-context.test.ts` | User status extraction |
| Checkout VIP verification | `tests/unit/orders-vip.test.ts` | Order creation blocking |

### Integration Tests
| Test | Location | Coverage |
|------|----------|----------|
| Product API VIP filtering | `tests/integration/catalog-vip.test.ts` | API responses differ by VIP status |
| Search API VIP filtering | `tests/integration/search-vip.test.ts` | Search excludes VIP products |
| Admin VIP endpoints | `tests/integration/admin-vip.test.ts` | CRUD operations |
| Checkout with VIP products | `tests/integration/orders-vip.test.ts` | Order creation scenarios |

### Test Scenarios
1. Non-VIP user cannot see VIP products in listing
2. Non-VIP user gets 404 for VIP product direct URL
3. VIP user can see and purchase VIP products
4. VIP products become visible after vipUntil passes
5. Non-VIP user cannot checkout with VIP product (cart manipulation)
6. Admin can bulk update VIP users
7. Admin can set/unset product VIP status
8. Feature flag disables all VIP filtering

---

## Technical Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| VIP storage | `User.isVip` boolean | Simple, sufficient for <100 VIPs |
| Product VIP fields | `vipOnly` + `vipUntil` on Product | Direct, no join tables needed |
| Filter location | Prisma middleware | Centralized, impossible to forget |
| Admin app | Separate Next.js app | Clean separation, same stack |
| Admin auth | Same JWT, ADMIN role | Reuse existing auth system |
| Checkout verification | At order creation only | Single security checkpoint |
| Timezone handling | UTC always | Industry standard, no confusion |
| Cache strategy | Separate keys by VIP status | Clean separation, no leakage |
| Cache invalidation | Short TTL (5min) + time check | Eventual consistency, simple |
| Bulk upload format | Textarea paste | Simple UI, sufficient for scale |
| Unknown emails | Ignore silently | Graceful handling, report count |
| Test coverage | Unit + integration | Sufficient for security-critical |
| Admin deployment | Same EKS, new service | Shared infra, good isolation |
| Feature flag | Env var toggle | Easy rollback if needed |

---

## Questions & Answers Log

| # | Question | Answer |
|---|----------|--------|
| 1 | VIP whitelist storage? | User.isVip flag on User table |
| 2 | Product VIP modeling? | Fields on Product (vipOnly + vipUntil) |
| 3 | Where should filter logic live? | Prisma middleware (auto-filter at ORM level) |
| 4 | Admin UI location? | Separate admin app |
| 5 | Admin app stack? | Next.js (same stack as frontend) |
| 6 | Admin authentication? | Same JWT, ADMIN role check |
| 7 | When to verify VIP at checkout? | At order creation only |
| 8 | Timezone handling? | UTC always |
| 9 | Cache strategy with VIP? | Separate cache keys by VIP status |
| 10 | Cache invalidation on VIP expiry? | Short TTL (5min) + time check |
| 11 | Bulk upload format? | Textarea paste (one per line/comma) |
| 12 | Unknown emails in bulk upload? | Ignore silently, report count |
| 13 | Test coverage level? | Unit + integration tests |
| 14 | Admin deployment? | Same EKS cluster, new service |
| 15 | Feature flag? | Yes, env var toggle (VIP_FEATURE_ENABLED) |

---

## Ticket JIRAs

### Epic: VIP-001 - VIP Early Access System

| Ticket | Title | Type | Priority | Estimate |
|--------|-------|------|----------|----------|
| VIP-002 | Add isVip field to User model | Task | High | S |
| VIP-003 | Add vipOnly/vipUntil fields to Product model | Task | High | S |
| VIP-004 | Implement Prisma VIP filtering middleware | Task | High | M |
| VIP-005 | Add VIP context hook to Fastify | Task | High | S |
| VIP-006 | Update cache keys for VIP separation | Task | High | M |
| VIP-007 | Add VIP verification to checkout | Task | High | S |
| VIP-008 | Create admin app scaffold (Next.js) | Task | High | M |
| VIP-009 | Implement admin auth (ADMIN role check) | Task | High | S |
| VIP-010 | Build VIP users management page | Task | Medium | M |
| VIP-011 | Build VIP products management page | Task | Medium | M |
| VIP-012 | Create admin API endpoints | Task | High | M |
| VIP-013 | Add Helm chart for admin app | Task | Medium | S |
| VIP-014 | Add ArgoCD application for admin | Task | Medium | S |
| VIP-015 | Create ECR repo for admin | Task | Medium | S |
| VIP-016 | Add admin CI/CD workflow | Task | Medium | M |
| VIP-017 | Add VIP_FEATURE_ENABLED env var | Task | Medium | S |
| VIP-018 | Write unit tests for VIP middleware | Task | High | M |
| VIP-019 | Write integration tests for VIP filtering | Task | High | M |
| VIP-020 | Update network policies for admin | Task | Medium | S |
| VIP-021 | Documentation update | Task | Low | S |

**Size Legend:** S = Small (1-2h), M = Medium (3-5h), L = Large (6-8h)

---

*Document created: 2026-01-10*
*Status: Ready for Implementation Planning*
