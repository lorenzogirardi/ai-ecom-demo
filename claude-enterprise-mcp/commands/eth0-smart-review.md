name: eth0-smart-review
description: Intelligent review orchestrator that runs appropriate reviews based on changes

---

Read the project context files first:
- CLAUDE.md, **/CLAUDE.md
- AGENTS.md, **/AGENTS.md
- README.md

You are an intelligent orchestrator. Analyze context and decide which reviews to run.

## Step 1: Context Analysis

Gather information:
1. Run `git diff --name-only HEAD~10` to see recently modified files
2. Run `git log --oneline -10` to see recent commits
3. Read `claude-docs/context-shared.md` if exists
4. Check for any existing recent review reports in `claude-docs/`

## Step 2: Change Classification

Classify modified files into categories:

| Pattern | Type | Required Review |
|---------|------|-----------------|
| `*.tf`, `terraform/` | Infrastructure | /eth0-platform-review |
| `helm/`, `k8s/`, `*.yaml` (deploy) | Platform | /eth0-platform-review |
| `Dockerfile`, `docker-compose*` | Container | /eth0-platform-review |
| `src/auth/`, `**/security/**` | Security-sensitive | /eth0-security-review |
| `**/api/**`, `**/routes/**` | API endpoints | /eth0-security-review |
| `src/**/*.ts`, `src/**/*.py` | Application code | /eth0-security-review (light) |
| `.github/workflows/`, `.gitlab-ci*` | CI/CD | /eth0-platform-review |
| `package.json`, `requirements.txt`, `go.mod` | Dependencies | /eth0-security-review |

## Step 3: Decision Matrix

Apply these rules to determine which reviews to run:

```
IF infrastructure changes (*.tf, helm/, k8s/) OR CI/CD changes:
   -> Run /eth0-platform-review

IF security-sensitive changes OR new dependencies OR API changes:
   -> Run /eth0-security-review (full)

IF only application code (no security-sensitive paths):
   -> Run /eth0-security-review (light - OWASP top 10 only)

IF close to release (check context-shared.md for sprint end date < 3 days):
   -> Run /eth0-delivery-review

IF user explicitly requests portfolio analysis:
   -> Run /eth0-portfolio-insights
```

## Step 4: Present Plan to User

Before executing, present the analysis:

```markdown
## Smart Review Analysis

**Changes detected:**
- Infrastructure: X files
- Security-sensitive: X files
- Application code: X files
- Dependencies: X files

**Reviews to run:**
1. [Review name] - Reason
2. [Review name] - Reason

**Reviews skipped:**
- [Review name] - Reason (e.g., no relevant changes)

Proceed with reviews? [Yes/No/Customize]
```

Wait for user confirmation before proceeding.

## Step 5: Execute Reviews

For each confirmed review:
1. Follow the instructions from the respective command file
2. Generate the report in `claude-docs/[review-type]-YYYYMMDD.md`
3. Track findings for the combined summary

## Step 6: Generate Combined Summary

Write `claude-docs/smart-review-YYYYMMDD.md`:

```markdown
# Smart Review Summary

**Date:** YYYY-MM-DD
**Triggered by:** [manual | pre-release | post-merge]
**Changes analyzed:** X files across Y commits

## Executive Summary

[1-2 sentence overall assessment]

## Changes Detected

| Category | Files | Examples |
|----------|-------|----------|
| Infrastructure | X | terraform/main.tf |
| Security-sensitive | X | src/auth/login.ts |
| Application | X | src/components/*.tsx |
| Dependencies | X | package.json |

## Reviews Executed

| Review | Result | Findings | Report |
|--------|--------|----------|--------|
| Security | PASS/WARN/FAIL | X HIGH, Y MEDIUM | [security-review-YYYYMMDD.md](./security-review-YYYYMMDD.md) |
| Platform | PASS/WARN/FAIL | X issues | [platform-review-YYYYMMDD.md](./platform-review-YYYYMMDD.md) |
| Delivery | PASS/WARN/FAIL | X blockers | [delivery-review-YYYYMMDD.md](./delivery-review-YYYYMMDD.md) |

## Overall Recommendation

**Status:** GO / NO-GO / CONDITIONAL

**Conditions (if applicable):**
1. ...

## Critical Findings

[List any HIGH or CRITICAL findings that need immediate attention]

## Next Actions

1. [ ] Action item from reviews
2. [ ] Action item from reviews
```

## Step 7: Update Shared Context

If `claude-docs/context-shared.md` exists, update it with:
- New risks identified
- Review results summary
- Updated blockers list

## Guardrails

- **ADVISE only** - Final decisions are human responsibility
- **Conservative** - When in doubt, recommend the more thorough review
- **Transparent** - Always explain why each review was selected or skipped
- **Non-blocking** - Allow user to skip or customize the review plan
