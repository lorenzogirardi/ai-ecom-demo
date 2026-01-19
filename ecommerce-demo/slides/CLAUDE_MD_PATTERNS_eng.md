# CLAUDE.md Patterns: Lessons from the E-commerce Project

Comparison between CLAUDE.md approaches based on the ecommerce-demo development experience (Day 1-10).

---

## Context: How ecommerce-demo Was Born

The ecommerce-demo project was developed in **10 sessions** with Claude Code.

**Challenge:** Maintain context between sessions and track progress.

**Solution adopted:** A very detailed CLAUDE.md (~635 lines) that functions as:
- Project README
- Session changelog
- Task tracker
- Operational runbook
- Technical notes

---

## Two Approaches Compared

| Aspect | agent-toolkit | ecommerce-demo |
|--------|---------------|----------------|
| **Lines** | ~150 | ~635 |
| **Philosophy** | "How to work" | "What we've done" |
| **Stability** | Stable | Changes every session |
| **Scope** | Multi-project | Single project |

---

## agent-toolkit: Convention-Centric

```markdown
# CLAUDE.md (~150 lines)

## Repository Overview          # What the repo is
## Repository Structure         # Directory structure
## Skill Categories             # Categorization
## Development Commands         # Validation commands
## Skill File Conventions       # MANDATORY rules
## Validation Rules             # Quality criteria
## Common Patterns              # Shared patterns
```

**Focus:** Rules and conventions to follow

**When Claude reads this file it learns:** How it should behave

---

## ecommerce-demo: Project-Centric

```markdown
# CLAUDE.md (~635 lines)

## Project Overview             # Tech stack
## Project Structure            # Detailed structure
## Development Commands         # Quick start
## Current State                # ⭐ CURRENT STATE
  ### Completed ✅ (Day 1-10)   # Everything DONE
  ### NOT Completed ❌          # What's MISSING
## Technical Notes              # Technical decisions
## Patterns and Conventions     # How code is written
## Next Steps                   # Next priorities
```

**Focus:** Project state and history

**When Claude reads this file it learns:** Where we are

---

## Concrete Example: Day 7

### With agent-toolkit style
```
User: "Improve backend performance"
Claude: *must explore the repo*
        *doesn't know what's been done*
        *might redo already completed work*
```

### With ecommerce-demo style
```
User: "Improve backend performance"
Claude: *reads CLAUDE.md*
        "I see that Day 6 you identified a bottleneck:
         backend pod at 97% CPU, 234 RPS.
         Day 7 you already did Pod Anti-Affinity and HPA.
         Result: 373 RPS, -46% latency.
         Next step could be..."
```

---

## Pros and Cons in E-commerce Context

### agent-toolkit Style

| Pros | Cons |
|------|------|
| Lightweight file | Claude doesn't know Day 6 discovered the bottleneck |
| No merge conflicts | Doesn't know HPA was already optimized |
| Reusable across projects | Must re-explore every session |
| Easy onboarding | Risks redoing already completed work |

### ecommerce-demo Style

| Pros | Cons |
|------|------|
| Claude knows exactly where we are | 635-line file |
| Doesn't repeat already done work | Merge conflicts if multi-developer |
| Knows decisions made | Must be updated every session |
| Can suggest logical next steps | Can become obsolete |

---

## The Problem: Multi-Developer

If ecommerce-demo were developed by a **team**:

```
Alice (Day 11 morning)          Bob (Day 11 afternoon)
     │                               │
     ├── git pull                    ├── git pull
     │                               │
     ├── Implements Feature A        ├── Implements Feature B
     │                               │
     ├── Updates CLAUDE.md           ├── Updates CLAUDE.md
     │   "Day 11: Feature A done"    │   "Day 11: Feature B done"
     │                               │
     ├── git push ✅                 │
     │                               ├── git push ❌ CONFLICT!
```

**635 lines = many conflict points**

---

## Solution: Hybrid Pattern

Take the best from both:

```
ecommerce-demo/
├── CLAUDE.md                 # Conventions (stable, ~150 lines)
├── .claude/
│   ├── status.md             # Progress tracking (volatile)
│   └── decisions/            # ADRs
└── ...
```

| File | Content | Update Frequency |
|------|---------|------------------|
| `CLAUDE.md` | How to work | Rare (monthly) |
| `.claude/status.md` | Where we are | Every session |
| `.claude/decisions/` | Why we chose X | When needed |

---

## Simplified CLAUDE.md (from agent-toolkit)

```markdown
# CLAUDE.md

## Project Overview
E-commerce monorepo: Next.js frontend, Fastify backend,
Terraform/EKS infrastructure.

## Structure
apps/frontend/    # Next.js 16
apps/backend/     # Fastify + Prisma
infra/terraform/  # AWS EKS
helm/             # Kubernetes charts

## Development Commands
docker-compose -f docker-compose.full.yml up --build
npm run dev       # Frontend :3000 + Backend :4000
npm run test      # All tests

## Conventions
- Backend modules: src/modules/{name}/{name}.routes.ts
- Frontend: App Router, components in src/components/
- Terraform: modules/ for reusable, environments/ for config

## Quality Gates
- npm run test must pass
- npm run lint must pass
- PR review required

---

## Project Status

👉 See `.claude/status.md` for current progress
👉 See `.claude/decisions/` for architecture decisions
```

**~50 lines instead of 635**

---

## .claude/status.md (Progress Tracking)

```markdown
# E-commerce Demo Status

**Last Updated:** 2026-01-14 by @lorenzo
**Current Phase:** Day 10 complete, Day 11 planning

## Completed Sessions

| Day | Focus | Key Results |
|-----|-------|-------------|
| 1-3 | Core App | Backend + Frontend + Tests |
| 4 | CI/CD | Security scanning, ArgoCD |
| 5 | AWS Deploy | EKS, RDS, CloudFront |
| 6 | Load Testing | k6, identified 97% CPU bottleneck |
| 7 | Performance | Anti-affinity, HPA: +59% RPS |
| 8 | Observability | X-Ray, Container Insights |
| 9 | Security | Network policies, ZAP scan |
| 10 | Ops Portal | 14 GitHub Actions for L1 |

## Current Metrics
- Throughput: 508 RPS (was 234 at Day 6)
- p95 Latency: 263ms (was 380ms)
- Error Rate: 0% (was 5.33%)

## Active Work

### @lorenzo
- [ ] Day 11 planning
- [ ] Cost optimization review

## Blockers
- None currently

## Next Steps
1. TBD based on Day 11 planning
```

---

## .claude/decisions/ (ADRs)

```
.claude/decisions/
├── 001-fastify-over-express.md
├── 002-terraform-layer-separation.md
├── 003-argocd-manual-sync.md
├── 004-redis-for-sessions.md
└── 005-hpa-45-percent-threshold.md
```

**Example: 005-hpa-45-percent-threshold.md**

```markdown
# ADR-005: HPA CPU Threshold at 45%

**Date:** 2026-01-XX (Day 7)
**Status:** Accepted

## Context
Day 6 stress test showed backend pod hitting 97% CPU
before HPA could scale (threshold was 70%).

## Decision
Reduce HPA CPU threshold from 70% to 45% for faster scaling.

## Consequences
- Faster reaction to load spikes
- May use slightly more pods during normal load
- Trade-off accepted for better user experience
```

---

## Multi-Developer: Anti-Conflict Strategies

### 1. Sections per Developer

```markdown
# .claude/status.md

## Active Work

### @alice
- [ ] Feature A (70%)

### @bob
- [ ] Feature B (50%)

### @charlie
- [x] Feature C (Done)
```

**Each developer only modifies their section**

---

### 2. File per Feature (large teams)

```
.claude/status/
├── sprint-current.md         # Sprint lead only
├── features/
│   ├── auth-redesign.md      # Owner: alice
│   ├── search-perf.md        # Owner: bob
│   └── payment.md            # Owner: charlie
└── blockers.md               # Anyone can add
```

**Zero conflicts: separate files**

---

### 3. Auto-Generated Status (CI)

```yaml
# .github/workflows/update-status.yml
on:
  push:
    branches: [main]

jobs:
  update-status:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate status
        run: |
          echo "# Auto-Generated Status" > .claude/status.md
          echo "Last updated: $(date)" >> .claude/status.md
          gh pr list --json title,author >> .claude/status.md
          git log --oneline -20 >> .claude/status.md
      - name: Commit
        run: |
          git add .claude/status.md
          git commit -m "chore: auto-update status" || true
          git push
```

**The bot is the only writer = zero conflicts**

---

## Which Approach for E-commerce-demo?

**Current situation:**
- 1 developer (Lorenzo)
- Sequential sessions (Day 1, 2, 3...)
- No conflict possible

**ecommerce-demo style works perfectly** for this case.

**If it became a team project:**

| Team Size | Approach |
|-----------|----------|
| 1-2 dev | Keep current CLAUDE.md |
| 3-5 dev | Split into CLAUDE.md + .claude/status.md |
| 6+ dev | Auto-generated status from CI |

---

## Recommended Workflow (Team)

```
┌─────────────────────────────────────────────────────────────┐
│                     SESSION START                            │
├─────────────────────────────────────────────────────────────┤
│  1. git pull                                                │
│  2. Claude reads CLAUDE.md (conventions)                    │
│  3. Claude reads .claude/status.md (current state)          │
│  4. Tell Claude what you'll work on                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     DURING WORK                              │
├─────────────────────────────────────────────────────────────┤
│  - Claude uses conventions from CLAUDE.md                   │
│  - Important decisions → .claude/decisions/NNN-xxx.md       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     SESSION END                              │
├─────────────────────────────────────────────────────────────┤
│  1. Update YOUR section in .claude/status.md                │
│  2. git add .claude/                                        │
│  3. git commit -m "chore: update status @username"          │
│  4. git pull --rebase && git push                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

| What to Take | From Which Approach |
|--------------|---------------------|
| Stable conventions | agent-toolkit |
| Progress tracking | ecommerce-demo |
| Documented decisions | ADR pattern |
| Anti-conflict | Sections per developer |

**Best of both worlds:**
- Claude knows how to work (conventions)
- Claude knows where we are (status)
- No merge conflicts (separate sections)

---

## Lessons Learned from E-commerce-demo

1. **Detailed CLAUDE.md = effective Claude**
   - Never redid already completed work
   - Always contextualized suggestions

2. **But doesn't scale for teams**
   - 635 lines = too many conflict points
   - Split necessary if multi-developer

3. **Progress tracking is essential**
   - "Day 6: CPU bottleneck 97%" → Day 7 knew what to fix
   - Without this, would have had to re-analyze

4. **Conventions separable from state**
   - Conventions = rarely change
   - State = every session

---

## Enterprise Integration: agent-toolkit Analysis

Analysis of `/agent-toolkit/` for enterprise multi-repo, multi-team adoption.

### Key Components from agent-toolkit

| Component | Purpose | Enterprise Value |
|-----------|---------|------------------|
| **Skills System** | Domain-specific prompts (.md with YAML) | Standardize practices across teams |
| **Decision Framework** | Autonomy tiers (🟢🟡🔴) | Governance and risk management |
| **CLAUDE.md-example** | Full user config template | Onboarding new developers |

### Skills Worth Adopting

**1. Infrastructure Skills**
- `terraform/SKILL.md` - IaC patterns, Atlantis integration
- `trivy/SKILL.md` - Security scanning pre-commit

**2. Development Workflow**
- `scm/SKILL.md` - Git conventions, branching strategies
- `spec-driven-dev/SKILL.md` - Feature specs → tasks → TDD

**3. TypeScript Skill (To Create)**
```markdown
# skills/typescript/SKILL.md
---
name: typescript
description: TypeScript conventions for ecommerce monorepo
triggers: ["*.ts", "*.tsx", "typescript", "type error"]
---

## Patterns
- Zod schemas in `schemas/`
- Strict null checks enabled
- Prisma types auto-generated

## Commands
npm run typecheck     # Check all
npm run lint:fix      # Auto-fix
```

---

## Enterprise Multi-Repo Architecture

For teams of 4-5 developers across multiple repositories:

```
company-root/
├── .claude/                          # Company-wide
│   ├── architecture.md               # Shared patterns
│   └── skills/                       # Shared skills
│
├── ecommerce-api/                    # Team Alpha (4 devs)
│   ├── CLAUDE.md                     # Repo-specific conventions
│   └── .claude/
│       ├── status.md                 # Team Alpha progress
│       └── decisions/                # Repo ADRs
│
├── ecommerce-web/                    # Team Beta (5 devs)
│   ├── CLAUDE.md
│   └── .claude/
│       ├── status.md
│       └── decisions/
│
└── infra/                            # Platform Team (3 devs)
    ├── CLAUDE.md
    └── .claude/
        ├── status.md
        └── decisions/
```

### Hierarchy

| Level | File | Content | Update Frequency |
|-------|------|---------|------------------|
| Company | `.claude/architecture.md` | Tech stack, auth patterns, API contracts | Quarterly |
| Repo | `CLAUDE.md` | Module conventions, commands | Monthly |
| Team | `.claude/status.md` | Sprint progress, blockers | Daily/Weekly |
| Decision | `.claude/decisions/*.md` | ADRs | As needed |

---

## Decision Framework (from agent-toolkit)

Implement autonomy tiers for enterprise governance:

```markdown
## Decision Framework

### 🟢 GREEN - Claude proceeds autonomously
- Code formatting, linting fixes
- Test file updates matching code changes
- Documentation typo fixes
- Dependency minor version updates

### 🟡 YELLOW - Claude asks before proceeding
- New dependencies
- Database schema changes
- API contract changes
- Configuration changes

### 🔴 RED - Always require approval
- Production deployments
- Security-related changes
- Infrastructure modifications
- Data migrations
```

**Benefit:** Reduces friction on safe operations while maintaining control on risky ones.

---

## Recommended Adoption Path

### Phase 1: Single Repo (Current)
Keep ecommerce-demo CLAUDE.md as-is. It works well for single developer.

### Phase 2: Team (3-5 devs)
```
ecommerce-demo/
├── CLAUDE.md                 # Slim down to conventions (~150 lines)
├── .claude/
│   ├── status.md             # Progress tracking (per-developer sections)
│   └── decisions/            # ADRs
└── ...
```

### Phase 3: Multi-Repo (6+ devs)
```
company/
├── .claude/architecture.md   # Shared standards
├── ecommerce-api/           # Own CLAUDE.md + .claude/status.md
├── ecommerce-web/           # Own CLAUDE.md + .claude/status.md
└── infra/                   # Own CLAUDE.md + .claude/status.md
```

### Phase 4: CI Auto-Generated Status
```yaml
# .github/workflows/update-status.yml
on:
  push:
    branches: [main]

jobs:
  update-status:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate status from git/PRs
        run: |
          echo "# Auto-Generated Status" > .claude/status.md
          echo "Last updated: $(date)" >> .claude/status.md
          gh pr list --json title,author,state >> .claude/status.md
          git log --oneline -20 >> .claude/status.md
      - name: Commit
        run: |
          git add .claude/status.md
          git commit -m "chore: auto-update status" || true
          git push
```

**Benefit:** Zero merge conflicts, always up-to-date.

---

## Summary: Best Practices

| Practice | Source | Why |
|----------|--------|-----|
| Conventions in CLAUDE.md | agent-toolkit | Stable, rarely changes |
| Progress in .claude/status.md | ecommerce-demo | Volatile, per-session |
| ADRs in .claude/decisions/ | ADR pattern | Capture "why" for future |
| Decision Framework (🟢🟡🔴) | agent-toolkit | Enterprise governance |
| Skills for domain knowledge | agent-toolkit | Standardize practices |
| CI auto-update | Hybrid | Zero conflicts at scale |

---

*Document based on 10 development sessions of ecommerce-demo with Claude Code*
*Enhanced with agent-toolkit enterprise patterns*
*Version: 2.0.0 - 2026-01-19*
