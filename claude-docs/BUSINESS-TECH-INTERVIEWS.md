# Business & Technical Interviews con Claude Code

## Overview

Questo documento descrive come utilizzare gli skill **wds-client-interview** e **wds-task-interview** per supportare rapidamente lo sviluppo di nuove feature di prodotto.

Questi due skill permettono di condurre sessioni strutturate di discovery con stakeholder business e tecnici, generando automaticamente documentazione completa (feature spec, tech spec, implementation plan) pronta per l'esecuzione.

---

## Gli Skill

### `/wds-client-interview` - Business Discovery

**Scopo:** Condurre una sessione PO/PM-level per raccogliere requisiti business.

**Cosa chiede:**
- Business case e motivazioni
- Target users e personas
- User stories e acceptance criteria
- Success metrics e KPIs
- Scope e priorità (MVP vs nice-to-have)
- Constraints e dependencies
- Risks e assumptions

**Output:** `feature-{FEATURE}.md` nella directory `claude-docs/`

### `/wds-task-interview` - Technical Discovery

**Scopo:** Approfondire aspetti tecnici di implementazione.

**Cosa chiede:**
- Data model e schema design
- Architecture e patterns
- Security considerations
- Caching strategy
- Testing approach
- Deployment strategy

**Output:** `techspec-{FEATURE}.md` nella directory `claude-docs/`

---

## Workflow Completo

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

**Tempo totale:** ~30-45 minuti per documentazione completa

---

## Case Study: VIP Early Access Feature

Di seguito la sessione completa di discovery per la feature "VIP Early Access" - un sistema per dare accesso anticipato a prodotti esclusivi per clienti VIP.

---

## Parte 1: Business Interview (`/wds-client-interview`)

### Avvio della sessione

L'utente invoca `/wds-client-interview` e Claude legge il contesto del progetto (CLAUDE.md, README.md) prima di iniziare.

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/business-interview-001.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/business-interview-001.png" width="800" alt="Business Interview - Start">
</a>

---

### Q1: Feature Description

**Domanda:** What feature would you like to implement?

**Risposta:** "We're thinking about giving early access for a few hours to the SNBN collection to our top clients; in this context, the question came up whether it was possible to make certain pages of the site accessible only to certain clients (e.g. we could white list top client emails so only them could access the products upon login); is this feasible?"

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/business-interview-002.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/business-interview-002.png" width="800" alt="Business Interview - Feature Description">
</a>

---

### Q2: Business Goal

**Domanda:** What is the primary business goal for this VIP early access feature?

**Opzioni:**
- Reward loyalty - Exclusive perk for top customers to increase retention
- Drive urgency - Create FOMO and drive faster purchase decisions
- Test demand - Gauge interest before general release
- Premium positioning - Position brand as exclusive/luxury

**Risposta:** "Reward loyalty"

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/business-interview-003.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/business-interview-003.png" width="800" alt="Business Interview - Business Goal">
</a>

---

### Q3: VIP Identification

**Domanda:** How do you currently identify 'top clients'? How would you provide the whitelist?

**Opzioni:**
- Manual email list - You provide a CSV/list of VIP customer emails
- Order history rules - Auto-qualify based on total spend or order count
- Customer tier/segment - You have an existing CRM segment or tier system
- Invitation codes - Send unique codes to VIPs, they enter to unlock

**Risposta:** "Manual email list"

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/business-interview-004.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/business-interview-004.png" width="800" alt="Business Interview - VIP Identification">
</a>

---

### Q4: VIP Privileges

**Domanda:** What should VIP users be able to do during early access that others cannot?

**Opzioni:**
- View only - VIPs can see the SNBN products, others see nothing
- View + Purchase - VIPs can view AND buy, others cannot see or buy
- Early purchase only - Everyone can see products, only VIPs can checkout

**Risposta:** "View + Purchase"

---

### Q5: Non-VIP Experience

**Domanda:** When a non-VIP user tries to access the gated page, what should happen?

**Opzioni:**
- 404 Not Found - Page doesn't exist for them - complete invisibility
- Coming Soon teaser - Show teaser page with countdown or 'coming soon' message
- Login prompt - Redirect to login with message 'VIP access required'
- Waitlist signup - Allow them to join waitlist for notification

**Risposta:** "Section should not be visible" (complete invisibility)

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/business-interview-005.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/business-interview-005.png" width="800" alt="Business Interview - Non-VIP Experience">
</a>

---

### Q6: Content Scope

**Domanda:** What exactly needs to be gated? Is it specific products, a category, or entire pages?

**Opzioni:**
- Specific products - Individual products are marked as VIP-only
- Entire category - A whole category (e.g., 'SNBN Collection') is VIP-only
- Landing page + products - A dedicated landing page and its associated products
- Dynamic campaigns - Flexible system where any content can be gated per campaign

**Risposta:** "Specific products"

---

### Q7: Time Control

**Domanda:** Is this early access time-bound? How does it end?

**Opzioni:**
- Manual toggle - Admin manually ends early access when ready
- Scheduled end time - Set a specific date/time when products become public
- Hybrid - Schedule but allow manual override if needed
- Permanent VIP - Some products stay VIP-only forever

**Risposta:** "Scheduled end time"

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/business-interview-006.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/business-interview-006.png" width="800" alt="Business Interview - Time Control">
</a>

---

### Q8: Admin UX

**Domanda:** How do you want to manage VIP products and whitelist? What's acceptable for MVP?

**Opzioni:**
- Database/API only - Seed via SQL or API calls - no UI needed for MVP
- Config file - JSON/YAML file with VIP emails and product slugs
- Simple admin page - Basic form to upload emails and select products
- Full admin panel - Complete management UI with history and analytics

**Risposta:** "Simple admin page"

---

### Q9: Scale

**Domanda:** Approximately how many VIP customers and gated products do you expect?

**Opzioni:**
- Small (<100 VIPs, <20 products) - Tight, curated list of top customers
- Medium (100-500 VIPs, 20-100 products) - Broader segment, multiple collections
- Large (500+ VIPs, 100+ products) - Significant portion of catalog and customers

**Risposta:** "Small (<100 VIPs, <20 products)"

---

### Q10: Success Metrics

**Domanda:** How will you measure if this VIP early access feature is successful?

**Opzioni:**
- VIP conversion rate - % of VIPs who purchase during early access
- VIP revenue - Total revenue from early access period
- Sell-through speed - How fast VIP products sell vs normal launches
- VIP retention - Do VIP customers come back more often?

**Risposta:** "VIP revenue"

---

### Q11: Constraints

**Domanda:** Are there any hard constraints or dependencies for this feature?

**Opzioni:**
- Upcoming launch date - SNBN collection has a fixed launch date we must hit
- Integration required - Must integrate with external CRM or email system
- No new infrastructure - Must work with current stack, no new services
- No constraints - Flexible on timing and approach

**Risposta:** "Upcoming launch date"

---

### Q12: Search/Navigation

**Domanda:** Should VIP products appear in search results or category listings for non-VIPs?

**Opzioni:**
- Completely hidden - VIP products don't appear anywhere for non-VIPs
- Hidden from browse, findable via direct URL - Not in listings but direct link shows 'VIP only' message
- Visible but locked - Show in listings with 'VIP only' badge, can't purchase

**Risposta:** "Completely hidden"

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/business-interview-007.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/business-interview-007.png" width="800" alt="Business Interview - Search/Navigation">
</a>

---

### Q13: Notification

**Domanda:** How will VIP customers know they have early access? Who handles notification?

**Opzioni:**
- External (you handle) - You'll email VIPs separately outside the app
- In-app banner - VIPs see a banner when logged in about their access
- Email via app - App should send email to VIPs when early access starts
- Both in-app + email - Full notification system built into the feature

**Risposta:** "External (you handle)"

---

### Q14: Risk

**Domanda:** What's your biggest concern or risk with this feature?

**Opzioni:**
- Security leak - Non-VIPs somehow accessing VIP products
- VIP list management - Keeping the whitelist accurate and up-to-date
- Timing coordination - Early access ending at wrong time
- Customer confusion - VIPs not understanding how to access their perks

**Risposta:** "Timing coordination"

---

### Output: Feature Spec

Al termine dell'interview, Claude genera automaticamente `feature-vip-early-access.md` con tutti i requisiti business documentati.

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/business-tech-interview-00.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/business-tech-interview-00.png" width="800" alt="Business Interview - Output">
</a>

---

## Parte 2: Technical Interview (`/wds-task-interview`)

### Avvio della sessione tecnica

Dopo aver completato la business interview, l'utente sceglie di procedere con la technical interview.

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/tech-interview-001.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/tech-interview-001.png" width="800" alt="Tech Interview - Start">
</a>

---

### Q1: Data Model - VIP Storage

**Domanda:** For the VIP whitelist, should we store it as a field on the User table or as a separate VipWhitelist table?

**Opzioni:**
- User.isVip flag (Recommended) - Simple boolean on User - works well for <100 VIPs, easy queries
- Separate VipWhitelist table - More flexible, allows VIPs without accounts, audit trail
- VipCampaign + membership - Full campaign system with user-campaign associations

**Risposta:** "User.isVip flag (Recommended)"

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/tech-interview-002.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/tech-interview-002.png" width="800" alt="Tech Interview - Data Model">
</a>

---

### Q2: Product Model

**Domanda:** For VIP products, how should we model the time-bound restriction?

**Opzioni:**
- Fields on Product (Recommended) - Add vipOnly:boolean + vipUntil:DateTime directly to Product table
- Separate VipProduct table - Join table with productId, startDate, endDate - supports history
- Campaign-based - VipCampaign table with products array - groups products together

**Risposta:** "Fields on Product (Recommended)"

---

### Q3: Filter Logic Location

**Domanda:** Where should VIP filtering logic live? This affects maintainability and security.

**Opzioni:**
- Prisma middleware (Recommended) - Auto-filter at ORM level - impossible to forget, centralized
- Service/repository layer - Explicit filtering in each service method - more visible but repetitive
- Route-level middleware - Filter in Fastify hooks per route - flexible but scattered
- Query helper function - Shared WHERE clause builder called explicitly

**Risposta:** "Prisma middleware (Recommended)"

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/tech-interview-003.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/tech-interview-003.png" width="800" alt="Tech Interview - Filter Logic">
</a>

---

### Q4: Admin UI Location

**Domanda:** Should the admin page be part of the existing frontend app or a separate admin app?

**Opzioni:**
- Same frontend, /admin route - Add /admin/vip pages to existing Next.js app with role check
- Separate admin app - New lightweight admin app (more isolation, more work)
- API-only, use Postman/curl - No UI for MVP - manage via API calls

**Risposta:** "Separate admin app"

---

### Q5: Admin Stack

**Domanda:** What framework/approach for the separate admin app?

**Opzioni:**
- Next.js (same stack) - Reuse existing patterns, shared types, familiar to team
- React + Vite (lighter) - Simpler SPA, faster builds, no SSR overhead
- Plain HTML + fetch - Minimal dependency, just forms calling API

**Risposta:** "Next.js (same stack)"

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/tech-interview-004.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/tech-interview-004.png" width="800" alt="Tech Interview - Admin Stack">
</a>

---

### Q6: Admin Authentication

**Domanda:** How should admin authentication work? The User table has a 'role' field already.

**Opzioni:**
- Same JWT, role=ADMIN check - Reuse existing auth, check user.role === 'ADMIN' on admin routes
- Separate admin credentials - Different login system for admin app (more secure, more work)
- API key / env secret - Simple shared secret in env vars (quick but less flexible)

**Risposta:** "Same JWT, role=ADMIN check"

---

### Q7: Checkout Security

**Domanda:** When a VIP user adds a product to cart and checks out, when should we verify VIP status?

**Opzioni:**
- At checkout only (Recommended) - Verify VIP status when order is created - single security checkpoint
- Add-to-cart + checkout - Block non-VIPs from adding to cart AND at checkout (defense in depth)
- Every cart operation - Check on every cart add/update/view (most secure, most overhead)

**Risposta:** "At checkout only (Recommended)"

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/tech-interview-005.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/tech-interview-005.png" width="800" alt="Tech Interview - Checkout Security">
</a>

---

### Q8: Timezone Handling

**Domanda:** How should we handle timezones for the vipUntil date? This was flagged as a risk.

**Opzioni:**
- UTC always (Recommended) - Store/compare in UTC, display in local timezone in admin UI
- Server timezone - Use server's configured timezone (simpler but can cause issues)
- User-selected timezone - Admin picks timezone when setting date (most flexible, more complex)

**Risposta:** "UTC always (Recommended)"

---

### Q9: Cache Strategy

**Domanda:** Product listings are cached in Redis. How should VIP filtering interact with the cache?

**Opzioni:**
- Separate cache keys (Recommended) - Different cache keys for VIP vs non-VIP responses
- No caching for VIP products - Skip cache entirely when VIP products exist - simpler but slower
- Post-cache filtering - Cache all products, filter VIP after cache retrieval (leaky)

**Risposta:** "Separate cache keys (Recommended)"

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/tech-interview-006.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/tech-interview-006.png" width="800" alt="Tech Interview - Cache Strategy">
</a>

---

### Q10: Cache Expiry

**Domanda:** When a product's vipUntil time passes, how should we handle cache invalidation?

**Opzioni:**
- Short TTL + time check (Recommended) - Keep short cache TTL (5min), always check vipUntil in query
- Scheduled job - Cron job clears cache when vipUntil passes - precise but adds complexity
- Manual invalidation - Admin manually clears cache after VIP period ends - simplest but error-prone

**Risposta:** "Short TTL + time check (Recommended)"

---

### Q11: Bulk Upload Format

**Domanda:** For bulk VIP email upload, what format should the admin use?

**Opzioni:**
- Textarea paste (Recommended) - Paste emails one per line or comma-separated - simple UI
- CSV file upload - Upload CSV with email column - better for large lists, more UI work
- Both options - Support both paste and file upload (most flexible)

**Risposta:** "Textarea paste (Recommended)"

---

### Q12: Unknown Emails

**Domanda:** If an admin adds an email that doesn't exist in the User table, what should happen?

**Opzioni:**
- Ignore silently (Recommended) - Skip non-existent emails, only update existing users - report count
- Error and reject - Fail the entire operation if any email doesn't exist
- Create placeholder - Pre-register email as VIP, apply when they sign up (more complex)

**Risposta:** "Ignore silently (Recommended)"

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/tech-interview-007.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/tech-interview-007.png" width="800" alt="Tech Interview - Unknown Emails">
</a>

---

### Q13: Testing

**Domanda:** What level of test coverage is expected for this security-critical feature?

**Opzioni:**
- Unit + integration (Recommended) - Test Prisma middleware, API endpoints, and VIP filtering logic
- E2E only - Full user journey tests covering VIP/non-VIP scenarios
- Comprehensive - Unit + integration + E2E + security-focused tests

**Risposta:** "Unit + integration (Recommended)"

---

### Q14: Admin Deployment

**Domanda:** How should we deploy the admin app? Same infrastructure or separate?

**Opzioni:**
- Same EKS cluster, new service - Add admin as third service alongside frontend/backend
- Same pod as frontend - Build admin into frontend container, different route prefix
- Separate environment - Deploy to separate infrastructure (more isolation, more cost)

**Risposta:** "Same EKS cluster, new service"

---

### Q15: Feature Flag

**Domanda:** Should there be a feature flag to enable/disable the entire VIP system?

**Opzioni:**
- Yes, env var toggle (Recommended) - VIP_FEATURE_ENABLED=true/false - easy to disable if issues
- No, always enabled - Deploy means enabled - simpler but riskier
- Database toggle - Admin can enable/disable via UI - most flexible

**Risposta:** "Yes, env var toggle (Recommended)"

---

### Output: Tech Spec + Tickets

Al termine, Claude genera `techspec-vip-early-access.md` con tutte le decisioni tecniche e i ticket JIRA con stime.

---

## Parte 3: Plan Mode

Dopo le interview, Claude entra in plan mode per esplorare il codebase e creare un piano di implementazione dettagliato.

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/plan-001.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/plan-001.png" width="800" alt="Plan Mode - Exploration">
</a>

---

### Output: Implementation Plan

Claude genera `plan-vip-early-access.md` con:
- 6 fasi di implementazione
- 19 file da creare/modificare
- Verification checklist
- Rollback strategy

<a href="https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/business-tech-interview/plan-002.png" target="_blank">
<img src="https://res.cloudinary.com/ethzero/image/upload/w_800/ai/ai-ecom-demo/business-tech-interview/plan-002.png" width="800" alt="Plan Mode - Output">
</a>

---

## Summary: Documenti Generati

| Documento | Contenuto | Tempo |
|-----------|-----------|-------|
| `feature-vip-early-access.md` | Business requirements, user stories, acceptance criteria | ~15 min |
| `techspec-vip-early-access.md` | Technical decisions, API design, JIRA tickets | ~15 min |
| `plan-vip-early-access.md` | Implementation plan, file changes, verification | ~10 min |

**Totale: ~40 minuti** per documentazione completa di una feature enterprise-ready.

---

## Stime Comparative

| | Developer Tradizionale | Claude Code |
|---|------------------------|-------------|
| **Discovery + Documentazione** | 2-3 giorni | 40 minuti |
| **Implementazione** | 2-3 settimane | 7 ore |
| **Totale** | 3-4 settimane | 1-2 giorni |

---

## Come Usare gli Skill

### Configurazione

Gli skill sono definiti in `.claude/skills/`:

```yaml
# .claude/skills/wds-client-interview.md
name: wds-client-interview
description: PO/PM discovery session with customer for a feature
---
[prompt content]
```

### Invocazione

```bash
# Avvia business interview
/wds-client-interview

# Avvia technical interview
/wds-task-interview
```

### Best Practices

1. **Preparazione:** Assicurati che CLAUDE.md sia aggiornato con lo stato del progetto
2. **Risposte concrete:** Dai risposte specifiche, non vaghe - Claude chiederà chiarimenti
3. **Scope MVP:** Distingui chiaramente tra must-have e nice-to-have
4. **Vincoli:** Comunica deadline e constraints upfront
5. **Follow-up:** Usa plan mode dopo le interview per generare il piano esecutivo

---

*Documento generato: 2026-01-10*
