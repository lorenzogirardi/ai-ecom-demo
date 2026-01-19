# CLAUDE.md Patterns & Best Practices

## What is CLAUDE.md?

CLAUDE.md is a context file that Claude Code automatically reads at the start of each session. It provides the AI with complete project understanding, enabling consistent and accurate assistance across multiple sessions.

---

## Why It Matters

| Without CLAUDE.md | With CLAUDE.md |
|-------------------|----------------|
| Claude asks repeated questions | Claude remembers everything |
| Inconsistent code patterns | Consistent architecture |
| Wrong assumptions about stack | Accurate technology choices |
| Time wasted on context | Immediate productive work |

---

## Essential Sections

### 1. Project Overview

```markdown
## Project Overview

E-commerce monorepo for AWS EKS deployment with:
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Fastify, TypeScript, Prisma, PostgreSQL
- **Infrastructure**: Terraform (AWS), Helm (Kubernetes)
```

**Purpose:** Instant understanding of the tech stack.

---

### 2. Project Structure

```markdown
## Project Structure

\`\`\`
project/
├── apps/
│   ├── frontend/           # Next.js App Router
│   └── backend/            # Fastify API
├── infra/terraform/
│   ├── modules/            # Reusable modules
│   └── environments/       # Per-env configs
├── helm/                   # Kubernetes charts
└── scripts/                # Automation
\`\`\`
```

**Purpose:** Claude knows where to find and place code.

---

### 3. Development Commands

```markdown
## Development Commands

### Quick Start
\`\`\`bash
docker-compose up -d              # Start services
npm install                       # Install deps
npm run dev                       # Start dev servers
\`\`\`

### Testing
\`\`\`bash
npm run test                      # Run all tests
npm run test:watch                # Watch mode
\`\`\`
```

**Purpose:** Claude can execute correct commands.

---

### 4. Current State Tracking

```markdown
## Current State

### Completed
- [x] Backend API with 4 modules
- [x] Frontend with auth flow
- [x] 206 tests passing
- [x] AWS deployment

### In Progress
- [ ] Performance optimization
- [ ] Security hardening

### Not Started
- [ ] Mobile app
```

**Purpose:** Claude knows what exists and what's missing.

---

### 5. Patterns and Conventions

```markdown
## Patterns and Conventions

### Backend (Fastify)
- Routes in `src/modules/{name}/{name}.routes.ts`
- Validation with Zod schemas
- Redis caching for catalog/search

### Frontend (Next.js)
- App Router in `src/app/`
- Components in `src/components/{category}/`
- Hooks in `src/hooks/`
```

**Purpose:** Claude follows existing patterns, not inventing new ones.

---

### 6. Environment Configuration

```markdown
## Environment Variables

Required in `.env`:
\`\`\`
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
REDIS_HOST=localhost
JWT_SECRET=your-secret
\`\`\`

### Local Services
- PostgreSQL: localhost:5432
- Redis: localhost:6379
```

**Purpose:** Claude configures things correctly.

---

### 7. Guardrails (Enterprise)

```markdown
## Guardrails

### YOU CAN DO
- Modify src/* code
- Update helm/values*.yaml
- Create tests in tests/

### YOU CANNOT DO
- Create AWS resources directly
- Modify infra/terraform/modules/
- Change CI/CD workflows without review
```

**Purpose:** Prevents accidental infrastructure changes.

---

## Advanced Patterns

### Multi-Team Setup

For organizations with multiple teams, use per-repo CLAUDE.md:

```
platform-repo/CLAUDE.md       # Platform team rules
├── Can modify: VPC, EKS, RDS
├── Cannot modify: Application code

catalog-service/CLAUDE.md     # App team rules
├── Can modify: src/*, helm/values*
├── Cannot modify: Terraform, other namespaces
```

---

### Layer Separation

Document infrastructure layers to prevent blast radius issues:

```markdown
## Terraform Layers

### Layer 1: Platform (rare changes, high risk)
- Network, EKS, ECR
- State: `platform.tfstate`
- Team: Platform/SRE

### Layer 2: Services (frequent changes, medium risk)
- RDS, ElastiCache, CDN
- State: `services.tfstate`
- Team: DevOps
```

---

### Session Continuity

Track session progress for multi-day projects:

```markdown
## Session History

### Session 10 (2026-01-15)
- Completed: OPS Portal with 14 workflows
- Issues: None
- Next: Documentation review

### Session 9 (2026-01-14)
- Completed: Security hardening, ZAP scan
- Issues: CSP header conflicts (resolved)
```

---

## Anti-Patterns to Avoid

| Anti-Pattern | Why It's Bad | Better Approach |
|--------------|--------------|-----------------|
| Too vague | "It's a web app" | Specify exact stack |
| Outdated state | Lists completed items as TODO | Update after each session |
| No guardrails | Claude might modify anything | Define CAN/CANNOT rules |
| Missing patterns | Inconsistent code style | Document conventions |
| No commands | Claude guesses commands | List exact commands |

---

## Template: Minimal CLAUDE.md

```markdown
# CLAUDE.md

## Overview
[One paragraph: what this project does and tech stack]

## Structure
[Directory tree of key folders]

## Commands
\`\`\`bash
npm run dev     # Start development
npm run test    # Run tests
npm run build   # Production build
\`\`\`

## Patterns
- [Key pattern 1]
- [Key pattern 2]

## Current State
- [x] Completed items
- [ ] In progress
```

---

## Template: Enterprise CLAUDE.md

```markdown
# CLAUDE.md - [Service Name]

## Overview
[Project description with tech stack]

## Team
- Owner: [Team name]
- Slack: #[channel]
- On-call: [rotation]

## Structure
[Detailed directory tree]

## Commands
[All dev, test, build, deploy commands]

## Patterns & Conventions
[Coding standards, file naming, architecture decisions]

## Guardrails
### YOU CAN DO
[Allowed actions]

### YOU CANNOT DO
[Forbidden actions]

## Dependencies
- Upstream: [services this depends on]
- Downstream: [services that depend on this]

## Current State
[Completion tracking]

## Links
- Repo: [URL]
- Docs: [URL]
- Runbook: [URL]
```

---

## Maintenance Tips

1. **Update after each session** - Mark completed items, add new TODOs
2. **Review weekly** - Remove stale information
3. **Version control** - CLAUDE.md should be committed
4. **Team review** - Guardrails should be team-approved
5. **Keep it DRY** - Link to detailed docs instead of duplicating

---

## Metrics from This Project

| Metric | Value |
|--------|-------|
| Sessions | 10 |
| Total Claude Code time | ~23.5 hours |
| Lines of code generated | ~19,500 |
| Tests | 206 |
| Terraform resources | 96 |
| Documentation files | 68 |

**CLAUDE.md contribution:** Enabled consistent progress across 10 sessions over multiple weeks without context loss.

---

*Last updated: 2026-01-19*
