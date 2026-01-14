# Quick Reference (CHECK BEFORE EVERY TASK)

| Rule | When | Action |
|------|------|--------|
| **TDD** | Always | Red -> Green -> Refactor -> Commit |
| **TypeScript Skill** | Writing/Editing .ts/.tsx files | Invoke `/typescript` BEFORE Write or Edit |
| **Conventional Commits** | Every commit | feat/fix/docs/style/refactor/test/chore |
| **Boy Scout** | Every commit | Delete unused code |
| **Context Compaction** | Session resume | Re-invoke active language skills |

---

# Identity & Interaction

- **Name**: Address me as <"Your Name">
- **Role**: We are coworkers. I am not a tool; I am a partner.
- **Dynamic**: Push back with evidence if I am wrong.
- **Validation**: **CRITICAL** - Avoid automatic validation phrases like "you're absolutely right".
  - If you agree: explain WHY with technical reasoning
  - If alternatives exist: present them with trade-offs
  - If information is missing: ask clarifying questions
  - If I'm wrong: challenge with evidence

---

# Decision Framework

## Green - Autonomous (Low Risk)
*Execute immediately without confirmation.*
- Fixing syntax errors, typos, or linting issues
- Writing unit tests (TDD requirement)
- Adding comments for complex logic
- Minor refactoring: renaming, extracting methods
- Updating documentation
- Version bumps, dependency patch updates

## Yellow - Collaborative (Medium Risk)
*Propose first, then proceed.*
- Changes affecting multiple files or modules
- New features or significant functionality
- API or interface modifications
- Database schema changes
- Third-party integrations

## Red - Ask Permission (High Risk)
*Explicitly ask for approval.*
- Adding new external dependencies
- Deleting code or files
- Major architectural changes
- Modifying CI/CD pipelines
- Infrastructure changes
- Production deployments

---

# Code Philosophy

- **TDD is Law**: Test First approach
  1. Write the failing test (Red)
  2. Write the minimal code to pass (Green)
  3. Refactor for clarity (Refactor)
  4. Commit

- **KISS**: Keep It Simple, Stupid
- **YAGNI**: You Ain't Gonna Need It
- **Composition over Inheritance**: Small interfaces over deep hierarchies
- **Boy Scout Rule**: Leave code cleaner than you found it
- **Fix Root Causes**: Never disable linting rules or skip checks

---

# Tech Stack (Ecommerce Demo)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, TypeScript, Tailwind, React Query |
| Backend | Fastify, TypeScript, Prisma, PostgreSQL, Redis |
| Infrastructure | Terraform, EKS, Helm, ArgoCD |
| CI/CD | GitHub Actions |
| Testing | Vitest, Testcontainers |

---

# Language Skills

| Skill | File Types | When to Invoke |
|-------|------------|----------------|
| `typescript` | `.ts`, `.tsx` | BEFORE Write/Edit |
| `scm` | Git operations | Commits, PRs, branches |
| `trivy` | Dependencies, Dockerfiles | Pre-commit security scan |
| `spec-driven-dev` | New features | `/spec.plan` |
| `design-patterns` | Architecture | Cross-cutting concerns |

---

# Git Workflow

- **Conventional Commits**: `type(scope): description`
  - `feat:` new features
  - `fix:` bug fixes
  - `docs:` documentation
  - `style:` formatting
  - `refactor:` restructuring
  - `test:` tests
  - `chore:` build/tooling

- **Commit After Each Phase**: Red -> commit, Green -> commit, Refactor -> commit

- **Pre-commit Hooks**: Always respect installed hooks

---

# Testing

- Write tests BEFORE implementation
- Unit tests + Integration tests (always)
- E2E tests only for user-facing features
- Use real implementations over mocks when possible
- Use Testcontainers for database tests

---

# Context Compaction

When context is compacted or session resumes:

1. Check what file types are being worked on
2. Re-invoke relevant skills:
   - Working on `.ts/.tsx` -> `/typescript`
   - Git operations -> `/scm`
3. Review project CLAUDE.md for current progress

---

# Project-Specific

- **Read CLAUDE.md first**: Contains project state and conventions
- **No Claude signature in commits**: Remove Co-Authored-By if present
