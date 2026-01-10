# Feature Specification: VIP Early Access

## Feature Overview

A gated content system that allows specific products to be visible and purchasable only by whitelisted VIP customers during a scheduled early access period. After the scheduled end time, products automatically become available to all customers.

### Core Concept
- **What:** Hide specific products from non-VIP users until a scheduled date
- **Who:** Top clients identified by email whitelist (manual)
- **Why:** Reward customer loyalty with exclusive early access to new collections

---

## Business Context

### Business Goal
**Primary:** Reward customer loyalty to increase retention

### Success Metric
**KPI:** VIP Revenue - Total revenue generated during early access period

### Constraints
- **Hard deadline:** SNBN collection has an upcoming launch date that must be met
- **Stack constraint:** Must work with existing infrastructure (no new services)

### Identified Risks
- **Timing coordination:** Ensuring early access ends at the correct time
  - *Mitigation:* Clear admin UI showing scheduled times, timezone handling, manual override capability

---

## Target Users & Personas

### VIP Customer (Primary)
- Top-tier customer identified by business
- Expects exclusive perks for their loyalty
- Will be notified externally (via email outside the app)
- Needs seamless access upon login - no extra steps

### Admin / Marketing (Secondary)
- Manages VIP whitelist and product selection
- Needs simple interface to set up early access campaigns
- Must be able to set precise start/end times

### Non-VIP Customer
- Should NOT see any indication that VIP products exist
- Complete invisibility - no "coming soon" or "VIP only" messages

---

## User Stories & Acceptance Criteria

### US-1: VIP Product Visibility
**As a** VIP customer,
**I want to** see exclusive products when I'm logged in,
**So that** I can browse and purchase before the general public.

**Acceptance Criteria:**
- [ ] VIP products appear in product listings when VIP user is logged in
- [ ] VIP products appear in search results for VIP users
- [ ] VIP products are accessible via direct URL for VIP users
- [ ] Product pages display normally with full purchase capability

### US-2: Non-VIP Invisibility
**As a** non-VIP customer (or guest),
**I want** the shopping experience to be unchanged,
**So that** I'm not aware of products I can't access.

**Acceptance Criteria:**
- [ ] VIP products do NOT appear in product listings for non-VIP users
- [ ] VIP products do NOT appear in search results for non-VIP users
- [ ] Direct URL access to VIP product returns 404 (not "access denied")
- [ ] No UI indication that VIP products exist (no badges, no counts)

### US-3: Scheduled End Time
**As an** admin,
**I want to** set a date/time when early access ends,
**So that** products automatically become public without manual intervention.

**Acceptance Criteria:**
- [ ] Admin can set end date/time when creating/editing VIP access
- [ ] Products automatically become visible to all users after end time
- [ ] Timezone is clearly displayed and handled correctly
- [ ] System uses server time (not client) for consistency

### US-4: VIP Whitelist Management
**As an** admin,
**I want to** manage the list of VIP customer emails,
**So that** I control who has early access.

**Acceptance Criteria:**
- [ ] Admin can add individual emails to whitelist
- [ ] Admin can bulk upload emails (CSV or paste)
- [ ] Admin can remove emails from whitelist
- [ ] Admin can view current whitelist with count
- [ ] Whitelist is case-insensitive (john@example.com = John@Example.com)

### US-5: VIP Product Selection
**As an** admin,
**I want to** mark specific products as VIP-only,
**So that** I control which products have early access.

**Acceptance Criteria:**
- [ ] Admin can select products to add to a VIP campaign
- [ ] Admin can set VIP start and end times per campaign
- [ ] Admin can view which products are currently VIP-restricted
- [ ] Products can be removed from VIP status manually

### US-6: VIP Purchase Flow
**As a** VIP customer,
**I want to** purchase VIP products normally,
**So that** the checkout experience is seamless.

**Acceptance Criteria:**
- [ ] VIP products can be added to cart
- [ ] Checkout flow works identically to normal products
- [ ] Order confirmation shows purchased items
- [ ] VIP status is verified at checkout (prevent cart manipulation)

---

## Scope & Priorities

### MVP (Must Have)
1. **VIP Whitelist** - Email-based whitelist stored in database
2. **Product VIP Flag** - Mark products as VIP-only with end date
3. **Visibility Filtering** - Hide VIP products from non-VIP users (listings, search, API)
4. **404 for Direct Access** - Non-VIPs get 404 on VIP product URLs
5. **Simple Admin Page** - Basic form to manage whitelist and VIP products
6. **Scheduled End Time** - Auto-expire VIP status at specified time

### Nice-to-Have (Post-MVP)
- VIP campaign history/analytics
- Multiple concurrent VIP campaigns
- Start time scheduling (not just end time)
- VIP badge visible to VIP users on products
- Audit log of whitelist changes

### Out of Scope
- Automatic VIP qualification (spend-based rules)
- CRM integration
- In-app notifications to VIP users
- Email sending from the application
- VIP-specific pricing/discounts

---

## Technical Considerations

### Data Model Changes
- `User` table: Add `isVip: Boolean` or separate `VipWhitelist` table
- `Product` table: Add `vipOnly: Boolean`, `vipEndDate: DateTime?`
- Consider: `VipCampaign` table for future multi-campaign support

### API Changes
- Product listing/search endpoints must filter VIP products based on user status
- Product detail endpoint must return 404 for non-VIP users on VIP products
- New admin endpoints for whitelist and VIP product management

### Frontend Changes
- Product queries must exclude VIP products for non-VIP users
- Ensure no client-side leakage of VIP product data
- Admin page for whitelist/product management

### Security Considerations
- VIP check must happen server-side (not just UI filtering)
- Cart/checkout must re-verify VIP status
- Consider rate limiting on admin endpoints
- Audit logging for whitelist changes (nice-to-have)

### Scale
- Expected: <100 VIP users, <20 VIP products
- Whitelist can be loaded into memory/cache
- Simple query filtering is sufficient (no complex optimization needed)

---

## Questions & Answers Log

| # | Question | Answer |
|---|----------|--------|
| 1 | What is the primary business goal? | Reward customer loyalty (retention) |
| 2 | How do you identify top clients? | Manual email list (CSV/whitelist) |
| 3 | What can VIPs do that others cannot? | View + Purchase (full access) |
| 4 | What happens when non-VIP accesses gated page? | Section should not be visible (complete invisibility) |
| 5 | What exactly needs to be gated? | Specific products (not categories) |
| 6 | Is early access time-bound? | Yes, scheduled end time (auto-expire) |
| 7 | What admin UX is acceptable for MVP? | Simple admin page (basic form) |
| 8 | How many VIPs and products expected? | Small (<100 VIPs, <20 products) |
| 9 | How will you measure success? | VIP revenue during early access |
| 10 | Any hard constraints? | Upcoming SNBN launch date |
| 11 | Should VIP products appear in search for non-VIPs? | No, completely hidden |
| 12 | How will VIPs be notified? | External (handled outside the app) |
| 13 | Biggest risk/concern? | Timing coordination |

---

## Next Steps

1. **Technical Interview** - Deep dive into implementation approach with engineering
2. **Plan Mode** - Create detailed implementation plan with file changes
3. **Implementation** - Build MVP feature
4. **Testing** - Verify VIP filtering works correctly (security-critical)
5. **Deploy** - Release before SNBN launch date

---

*Document created: 2026-01-10*
*Status: Ready for Technical Review*
