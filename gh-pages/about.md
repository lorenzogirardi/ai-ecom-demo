---
layout: default
title: About
permalink: /about/
---

<div class="container about-content">

# About This Project

This blog documents the journey of building a **production-ready e-commerce platform in 10 days** using Claude Code as an AI development assistant.

## The Challenge

In many organizations, software development faces common challenges:

- **Team fragmentation**: 70 developers across multiple teams with limited communication
- **Ownership confusion**: Who changes infrastructure instead of code to "make it work"
- **Velocity problems**: Workarounds instead of solutions, growing technical debt

## The Experiment

What if a single developer, augmented by AI, could match the output of an entire team?

**The goal**: Build a complete e-commerce platform with:
- Full-stack application (Next.js + Fastify)
- Production infrastructure (AWS EKS, RDS, ElastiCache)
- CI/CD pipelines with security scanning
- Load testing and performance optimization
- Security hardening (Zero Trust, OWASP compliance)
- Operational self-service portal

## The Results

<div class="metric-grid">
    <div class="metric-box">
        <div class="value">10</div>
        <div class="label">Days to Production</div>
    </div>
    <div class="metric-box">
        <div class="value">508</div>
        <div class="label">Requests/Second</div>
    </div>
    <div class="metric-box">
        <div class="value">206</div>
        <div class="label">Automated Tests</div>
    </div>
    <div class="metric-box">
        <div class="value">168</div>
        <div class="label">Security Checks Passed</div>
    </div>
</div>

### Traditional Approach vs AI-Augmented

| Aspect | Traditional | AI-Augmented |
|--------|-------------|--------------|
| Timeline | 10-14 weeks | 10 days |
| Team Size | 5-8 people | 1 person |
| Documentation | "We'll do it later" | 40+ diagrams generated |
| Test Coverage | Variable (<50%) | >80% by design |
| Load Testing | Often skipped | 397K requests validated |

## Key Insight: Multiplier, Not Replacement

**AI does not replace developers.** It multiplies their capabilities.

The human developer still:
- Makes architectural decisions
- Defines requirements and constraints
- Reviews and validates AI output
- Applies domain knowledge
- Handles edge cases and debugging

AI excels at:
- Generating boilerplate code
- Writing tests alongside code
- Maintaining consistency across files
- Contextual CVE analysis
- Documentation generation

## Technology Stack

**Application**
- Frontend: Next.js 16, React, Tailwind CSS
- Backend: Fastify, Prisma, PostgreSQL
- Cache: Redis (ElastiCache)

**Infrastructure**
- Cloud: AWS (EKS, RDS, ElastiCache, CloudFront)
- IaC: Terraform, Helm
- CI/CD: GitHub Actions, ArgoCD

**Quality**
- Testing: Vitest, 206 tests
- Security: Trivy, Checkov, Gitleaks, OWASP ZAP
- Load Testing: k6

## Resources

- **Repository**: [github.com/lorenzogirardi/ai-ecom-demo](https://github.com/lorenzogirardi/ai-ecom-demo)
- **Live Demo**: [dls03qes9fc77.cloudfront.net](https://dls03qes9fc77.cloudfront.net)
- **Session Recording**: [YouTube](https://youtu.be/tNtAPNx70bc)

## Author

**Lorenzo Girardi**

This experiment was conducted to demonstrate the potential of AI-augmented development in enterprise environments.

</div>
