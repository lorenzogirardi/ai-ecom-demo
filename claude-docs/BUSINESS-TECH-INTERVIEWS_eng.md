# Business & Technical Interviews with Claude Code

## Overview

This document describes how to use the **wds-client-interview** and **wds-task-interview** skills to rapidly support new product feature development.

These two skills enable structured discovery sessions with business and technical stakeholders, automatically generating complete documentation (feature spec, tech spec, implementation plan) ready for execution.

---

## The Skills

### `/wds-client-interview` - Business Discovery

**Purpose:** Conduct a PO/PM-level session to gather business requirements.

**What it asks:**
- Business case and motivations
- Target users and personas
- User stories and acceptance criteria
- Success metrics and KPIs
- Scope and priorities (MVP vs nice-to-have)
- Constraints and dependencies
- Risks and assumptions

**Output:** `feature-{FEATURE}.md` in the `claude-docs/` directory

### `/wds-task-interview` - Technical Discovery

**Purpose:** Deep dive into technical implementation aspects.

**What it asks:**
- Data model and schema design
- Architecture and patterns
- Security considerations
- Caching strategy
- Testing approach
- Deployment strategy

**Output:** `techspec-{FEATURE}.md` in the `claude-docs/` directory

---

## Complete Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│  1. /wds-client-interview                                       │
│     └─> feature-{name}.md (business requirements)               │
├─────────────────────────────────────────────────────────────────┤
│  2. /wds-task-interview                                         │
│     └─> techspec-{name}.md (technical decisions + tickets)      │
├─────────────────────────────────────────────────────────────────┤
│  3. Plan Mode                                                   │
│     └─> plan-{name}.md (implementation plan)                    │
├─────────────────────────────────────────────────────────────────┤
│  4. Execute                                                     │
│     └─> Working code + tests                                    │
└─────────────────────────────────────────────────────────────────┘
```

**Total time:** ~30-45 minutes for complete documentation

---

## Case Study: VIP Early Access Feature

Below is the complete discovery session for the "VIP Early Access" feature - a system to give early access to exclusive products for VIP customers.

---

## Part 1: Business Interview (`/wds-client-interview`)

### Session Start

The user invokes `/wds-client-interview` and Claude reads the project context (CLAUDE.md, README.md) before starting.

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/business-interview-001.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/business-interview-001.png" width="800" alt="Business Interview - Start">
</a>

---

### Q1: Feature Description

**Question:** What feature would you like to implement?

**Answer:** "We're thinking about giving early access for a few hours to the SNBN collection to our top clients; in this context, the question came up whether it was possible to make certain pages of the site accessible only to certain clients (e.g. we could white list top client emails so only them could access the products upon login); is this feasible?"

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/business-interview-002.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/business-interview-002.png" width="800" alt="Business Interview - Feature Description">
</a>

---

### Q2: Business Goal

**Question:** What is the primary business goal for this VIP early access feature?

**Options:**
- Reward loyalty - Exclusive perk for top customers to increase retention
- Drive urgency - Create FOMO and drive faster purchase decisions
- Test demand - Gauge interest before general release
- Premium positioning - Position brand as exclusive/luxury

**Answer:** "Reward loyalty"

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/business-interview-003.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/business-interview-003.png" width="800" alt="Business Interview - Business Goal">
</a>

---

### Q3: VIP Identification

**Question:** How do you currently identify 'top clients'? How would you provide the whitelist?

**Options:**
- Manual email list - You provide a CSV/list of VIP customer emails
- Order history rules - Auto-qualify based on total spend or order count
- Customer tier/segment - You have an existing CRM segment or tier system
- Invitation codes - Send unique codes to VIPs, they enter to unlock

**Answer:** "Manual email list"

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/business-interview-004.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/business-interview-004.png" width="800" alt="Business Interview - VIP Identification">
</a>

---

### Q4: VIP Privileges

**Question:** What should VIP users be able to do during early access that others cannot?

**Options:**
- View only - VIPs can see the SNBN products, others see nothing
- View + Purchase - VIPs can view AND buy, others cannot see or buy
- Early purchase only - Everyone can see products, only VIPs can checkout

**Answer:** "View + Purchase"

---

### Q5: Non-VIP Experience

**Question:** When a non-VIP user tries to access the gated page, what should happen?

**Options:**
- 404 Not Found - Page doesn't exist for them - complete invisibility
- Coming Soon teaser - Show teaser page with countdown or 'coming soon' message
- Login prompt - Redirect to login with message 'VIP access required'
- Waitlist signup - Allow them to join waitlist for notification

**Answer:** "Section should not be visible" (complete invisibility)

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/business-interview-005.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/business-interview-005.png" width="800" alt="Business Interview - Non-VIP Experience">
</a>

---

### Q6: Content Scope

**Question:** What exactly needs to be gated? Is it specific products, a category, or entire pages?

**Options:**
- Specific products - Individual products are marked as VIP-only
- Entire category - A whole category (e.g., 'SNBN Collection') is VIP-only
- Landing page + products - A dedicated landing page and its associated products
- Dynamic campaigns - Flexible system where any content can be gated per campaign

**Answer:** "Specific products"

---

### Q7: Time Control

**Question:** Is this early access time-bound? How does it end?

**Options:**
- Manual toggle - Admin manually ends early access when ready
- Scheduled end time - Set a specific date/time when products become public
- Hybrid - Schedule but allow manual override if needed
- Permanent VIP - Some products stay VIP-only forever

**Answer:** "Scheduled end time"

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/business-interview-006.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/business-interview-006.png" width="800" alt="Business Interview - Time Control">
</a>

---

### Q8: Admin UX

**Question:** How do you want to manage VIP products and whitelist? What's acceptable for MVP?

**Options:**
- Database/API only - Seed via SQL or API calls - no UI needed for MVP
- Config file - JSON/YAML file with VIP emails and product slugs
- Simple admin page - Basic form to upload emails and select products
- Full admin panel - Complete management UI with history and analytics

**Answer:** "Simple admin page"

---

### Q9: Scale

**Question:** Approximately how many VIP customers and gated products do you expect?

**Options:**
- Small (<100 VIPs, <20 products) - Tight, curated list of top customers
- Medium (100-500 VIPs, 20-100 products) - Broader segment, multiple collections
- Large (500+ VIPs, 100+ products) - Significant portion of catalog and customers

**Answer:** "Small (<100 VIPs, <20 products)"

---

### Q10: Success Metrics

**Question:** How will you measure if this VIP early access feature is successful?

**Options:**
- VIP conversion rate - % of VIPs who purchase during early access
- VIP revenue - Total revenue from early access period
- Sell-through speed - How fast VIP products sell vs normal launches
- VIP retention - Do VIP customers come back more often?

**Answer:** "VIP revenue"

---

### Q11: Constraints

**Question:** Are there any hard constraints or dependencies for this feature?

**Options:**
- Upcoming launch date - SNBN collection has a fixed launch date we must hit
- Integration required - Must integrate with external CRM or email system
- No new infrastructure - Must work with current stack, no new services
- No constraints - Flexible on timing and approach

**Answer:** "Upcoming launch date"

---

### Q12: Search/Navigation

**Question:** Should VIP products appear in search results or category listings for non-VIPs?

**Options:**
- Completely hidden - VIP products don't appear anywhere for non-VIPs
- Hidden from browse, findable via direct URL - Not in listings but direct link shows 'VIP only' message
- Visible but locked - Show in listings with 'VIP only' badge, can't purchase

**Answer:** "Completely hidden"

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/business-interview-007.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/business-interview-007.png" width="800" alt="Business Interview - Search/Navigation">
</a>

---

### Q13: Notification

**Question:** How will VIP customers know they have early access? Who handles notification?

**Options:**
- External (you handle) - You'll email VIPs separately outside the app
- In-app banner - VIPs see a banner when logged in about their access
- Email via app - App should send email to VIPs when early access starts
- Both in-app + email - Full notification system built into the feature

**Answer:** "External (you handle)"

---

### Q14: Risk

**Question:** What's your biggest concern or risk with this feature?

**Options:**
- Security leak - Non-VIPs somehow accessing VIP products
- VIP list management - Keeping the whitelist accurate and up-to-date
- Timing coordination - Early access ending at wrong time
- Customer confusion - VIPs not understanding how to access their perks

**Answer:** "Timing coordination"

---

### Output: Feature Spec

At the end of the interview, Claude automatically generates `feature-vip-early-access.md` with all documented business requirements.

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/business-tech-interview-00.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/business-tech-interview-00.png" width="800" alt="Business Interview - Output">
</a>

---

## Part 2: Technical Interview (`/wds-task-interview`)

### Technical Session Start

After completing the business interview, the user chooses to proceed with the technical interview.

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/tech-interview-001.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/tech-interview-001.png" width="800" alt="Tech Interview - Start">
</a>

---

### Q1: Data Model - VIP Storage

**Question:** For the VIP whitelist, should we store it as a field on the User table or as a separate VipWhitelist table?

**Options:**
- User.isVip flag (Recommended) - Simple boolean on User - works well for <100 VIPs, easy queries
- Separate VipWhitelist table - More flexible, allows VIPs without accounts, audit trail
- VipCampaign + membership - Full campaign system with user-campaign associations

**Answer:** "User.isVip flag (Recommended)"

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/tech-interview-002.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/tech-interview-002.png" width="800" alt="Tech Interview - Data Model">
</a>

---

### Q2: Product Model

**Question:** For VIP products, how should we model the time-bound restriction?

**Options:**
- Fields on Product (Recommended) - Add vipOnly:boolean + vipUntil:DateTime directly to Product table
- Separate VipProduct table - Join table with productId, startDate, endDate - supports history
- Campaign-based - VipCampaign table with products array - groups products together

**Answer:** "Fields on Product (Recommended)"

---

### Q3: Filter Logic Location

**Question:** Where should VIP filtering logic live? This affects maintainability and security.

**Options:**
- Prisma middleware (Recommended) - Auto-filter at ORM level - impossible to forget, centralized
- Service/repository layer - Explicit filtering in each service method - more visible but repetitive
- Route-level middleware - Filter in Fastify hooks per route - flexible but scattered
- Query helper function - Shared WHERE clause builder called explicitly

**Answer:** "Prisma middleware (Recommended)"

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/tech-interview-003.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/tech-interview-003.png" width="800" alt="Tech Interview - Filter Logic">
</a>

---

### Q4: Admin UI Location

**Question:** Should the admin page be part of the existing frontend app or a separate admin app?

**Options:**
- Same frontend, /admin route - Add /admin/vip pages to existing Next.js app with role check
- Separate admin app - New lightweight admin app (more isolation, more work)
- API-only, use Postman/curl - No UI for MVP - manage via API calls

**Answer:** "Separate admin app"

---

### Q5: Admin Stack

**Question:** What framework/approach for the separate admin app?

**Options:**
- Next.js (same stack) - Reuse existing patterns, shared types, familiar to team
- React + Vite (lighter) - Simpler SPA, faster builds, no SSR overhead
- Plain HTML + fetch - Minimal dependency, just forms calling API

**Answer:** "Next.js (same stack)"

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/tech-interview-004.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/tech-interview-004.png" width="800" alt="Tech Interview - Admin Stack">
</a>

---

### Q6: Admin Authentication

**Question:** How should admin authentication work? The User table has a 'role' field already.

**Options:**
- Same JWT, role=ADMIN check - Reuse existing auth, check user.role === 'ADMIN' on admin routes
- Separate admin credentials - Different login system for admin app (more secure, more work)
- API key / env secret - Simple shared secret in env vars (quick but less flexible)

**Answer:** "Same JWT, role=ADMIN check"

---

### Q7: Checkout Security

**Question:** When a VIP user adds a product to cart and checks out, when should we verify VIP status?

**Options:**
- At checkout only (Recommended) - Verify VIP status when order is created - single security checkpoint
- Add-to-cart + checkout - Block non-VIPs from adding to cart AND at checkout (defense in depth)
- Every cart operation - Check on every cart add/update/view (most secure, most overhead)

**Answer:** "At checkout only (Recommended)"

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/tech-interview-005.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/tech-interview-005.png" width="800" alt="Tech Interview - Checkout Security">
</a>

---

### Q8: Timezone Handling

**Question:** How should we handle timezones for the vipUntil date? This was flagged as a risk.

**Options:**
- UTC always (Recommended) - Store/compare in UTC, display in local timezone in admin UI
- Server timezone - Use server's configured timezone (simpler but can cause issues)
- User-selected timezone - Admin picks timezone when setting date (most flexible, more complex)

**Answer:** "UTC always (Recommended)"

---

### Q9: Cache Strategy

**Question:** Product listings are cached in Redis. How should VIP filtering interact with the cache?

**Options:**
- Separate cache keys (Recommended) - Different cache keys for VIP vs non-VIP responses
- No caching for VIP products - Skip cache entirely when VIP products exist - simpler but slower
- Post-cache filtering - Cache all products, filter VIP after cache retrieval (leaky)

**Answer:** "Separate cache keys (Recommended)"

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/tech-interview-006.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/tech-interview-006.png" width="800" alt="Tech Interview - Cache Strategy">
</a>

---

### Q10: Cache Expiry

**Question:** When a product's vipUntil time passes, how should we handle cache invalidation?

**Options:**
- Short TTL + time check (Recommended) - Keep short cache TTL (5min), always check vipUntil in query
- Scheduled job - Cron job clears cache when vipUntil passes - precise but adds complexity
- Manual invalidation - Admin manually clears cache after VIP period ends - simplest but error-prone

**Answer:** "Short TTL + time check (Recommended)"

---

### Q11: Bulk Upload Format

**Question:** For bulk VIP email upload, what format should the admin use?

**Options:**
- Textarea paste (Recommended) - Paste emails one per line or comma-separated - simple UI
- CSV file upload - Upload CSV with email column - better for large lists, more UI work
- Both options - Support both paste and file upload (most flexible)

**Answer:** "Textarea paste (Recommended)"

---

### Q12: Unknown Emails

**Question:** If an admin adds an email that doesn't exist in the User table, what should happen?

**Options:**
- Ignore silently (Recommended) - Skip non-existent emails, only update existing users - report count
- Error and reject - Fail the entire operation if any email doesn't exist
- Create placeholder - Pre-register email as VIP, apply when they sign up (more complex)

**Answer:** "Ignore silently (Recommended)"

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/tech-interview-007.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/tech-interview-007.png" width="800" alt="Tech Interview - Unknown Emails">
</a>

---

### Q13: Testing

**Question:** What level of test coverage is expected for this security-critical feature?

**Options:**
- Unit + integration (Recommended) - Test Prisma middleware, API endpoints, and VIP filtering logic
- E2E only - Full user journey tests covering VIP/non-VIP scenarios
- Comprehensive - Unit + integration + E2E + security-focused tests

**Answer:** "Unit + integration (Recommended)"

---

### Q14: Admin Deployment

**Question:** How should we deploy the admin app? Same infrastructure or separate?

**Options:**
- Same EKS cluster, new service - Add admin as third service alongside frontend/backend
- Same pod as frontend - Build admin into frontend container, different route prefix
- Separate environment - Deploy to separate infrastructure (more isolation, more cost)

**Answer:** "Same EKS cluster, new service"

---

### Q15: Feature Flag

**Question:** Should there be a feature flag to enable/disable the entire VIP system?

**Options:**
- Yes, env var toggle (Recommended) - VIP_FEATURE_ENABLED=true/false - easy to disable if issues
- No, always enabled - Deploy means enabled - simpler but riskier
- Database toggle - Admin can enable/disable via UI - most flexible

**Answer:** "Yes, env var toggle (Recommended)"

---

### Output: Tech Spec + Tickets

At the end, Claude generates `techspec-vip-early-access.md` with all technical decisions and JIRA tickets with estimates.

---

## Part 3: Plan Mode

After the interviews, Claude enters plan mode to explore the codebase and create a detailed implementation plan.

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/plan-001.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/plan-001.png" width="800" alt="Plan Mode - Exploration">
</a>

---

### Output: Implementation Plan

Claude generates `plan-vip-early-access.md` with:
- 6 implementation phases
- 19 files to create/modify
- Verification checklist
- Rollback strategy

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/plan-002.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/plan-002.png" width="800" alt="Plan Mode - Output">
</a>

---

## Summary: Generated Documents

| Document | Content | Time |
|----------|---------|------|
| `feature-vip-early-access.md` | Business requirements, user stories, acceptance criteria | ~15 min |
| `techspec-vip-early-access.md` | Technical decisions, API design, JIRA tickets | ~15 min |
| `plan-vip-early-access.md` | Implementation plan, file changes, verification | ~10 min |

**Total: ~40 minutes** for complete documentation of an enterprise-ready feature.

---

## Comparative Estimates

| | Traditional Developer | Claude Code |
|---|----------------------|-------------|
| **Discovery + Documentation** | 2-3 days | 40 minutes |
| **Implementation** | 2-3 weeks | 7 hours |
| **Total** | 3-4 weeks | 1-2 days |

---

## How to Use the Skills

### Configuration

Skills are defined in `.claude/skills/`:

```yaml
# .claude/skills/wds-client-interview.md
name: wds-client-interview
description: PO/PM discovery session with customer for a feature
---
[prompt content]
```

### Invocation

```bash
# Start business interview
/wds-client-interview

# Start technical interview
/wds-task-interview
```

### Best Practices

1. **Preparation:** Ensure CLAUDE.md is up to date with project status
2. **Concrete answers:** Give specific answers, not vague ones - Claude will ask for clarification
3. **MVP scope:** Clearly distinguish between must-have and nice-to-have
4. **Constraints:** Communicate deadlines and constraints upfront
5. **Follow-up:** Use plan mode after interviews to generate the execution plan

---

*Document generated: 2026-01-10*
