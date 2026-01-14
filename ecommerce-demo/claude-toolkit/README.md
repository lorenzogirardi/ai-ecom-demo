# Claude Toolkit for Ecommerce

Skills and templates adapted from [agent-toolkit](https://github.com/anthropics/agent-toolkit) for enterprise ecommerce development.

**Status:** Documentation only. Not actively used.

## How to Activate

To use these skills, copy the desired folder to `~/.claude/skills/`:

```bash
# Copy single skill
cp -r claude-toolkit/skills/typescript ~/.claude/skills/

# Copy all skills
cp -r claude-toolkit/skills/* ~/.claude/skills/

# Copy user config template
cp claude-toolkit/CLAUDE.md-template ~/.claude.md
```

## Structure

```
claude-toolkit/
├── README.md                      # This file
├── CLAUDE.md-template             # User config template
├── status.md-template             # Progress tracking template
├── templates/                     # Spec and task templates
│   ├── spec.md
│   └── tasks.md
└── skills/                        # Domain-specific skills
    ├── typescript/SKILL.md        # TypeScript/Node.js conventions
    ├── scm/                       # Git workflow
    │   ├── SKILL.md
    │   └── references/commit-workflow.md
    ├── trivy/SKILL.md             # Security scanning
    ├── spec-driven-dev/           # Feature specs
    │   ├── SKILL.md
    │   └── references/templates.md
    └── design-patterns/           # Architecture patterns
        ├── SKILL.md
        └── references/typescript-patterns.md
```

## Skills Overview

| Skill | Trigger | Purpose |
|-------|---------|---------|
| **typescript** | `.ts`, `.tsx` files | TypeScript conventions, Prisma, Zod |
| **scm** | Git operations | Conventional commits, PR workflow |
| **trivy** | Dependencies, Dockerfiles | Pre-commit security scanning |
| **spec-driven-dev** | `/spec.plan` | Feature specs to tasks |
| **design-patterns** | Architecture | DI, error handling, testing |

## Decision Framework

From agent-toolkit, adapted for ecommerce:

| Tier | Color | Action | Examples |
|------|-------|--------|----------|
| Low Risk | Green | Proceed autonomously | Lint fixes, test updates, docs |
| Medium Risk | Yellow | Propose first | New deps, API changes, schema |
| High Risk | Red | Require approval | Infra, deploys, data migrations |

## Multi-Team Usage

For teams of 4-5 developers per repo:

1. **Each repo** has its own `CLAUDE.md` (conventions)
2. **Shared** `company/.claude/architecture.md` (standards)
3. **Each team** maintains their section in `status.md`
4. **CI auto-updates** status.md (optional, zero conflicts)

See `/slides/CLAUDE_MD_PATTERNS.md` for detailed patterns.

## Related Documentation

- Project conventions: `/CLAUDE.md`
- Patterns analysis: `/slides/CLAUDE_MD_PATTERNS.md`
- Original toolkit: https://github.com/anthropics/agent-toolkit
