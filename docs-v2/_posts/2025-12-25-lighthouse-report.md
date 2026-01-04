---
layout: post
title: "Lighthouse Performance Report"
date: 2025-12-25
category: technical
order: 13
reading_time: 3
tags: [lighthouse, performance, accessibility, seo, web-vitals]
excerpt: "Google Lighthouse audit results: Performance 92, Accessibility 90, Best Practices 96, SEO 100."
takeaway: "Excellent scores across all categories with minor TBT optimization opportunity."
---

## Scores Overview

| Category | Score |
|----------|-------|
| Performance | **92** |
| Accessibility | **90** |
| Best Practices | **96** |
| SEO | **100** |

## Core Web Vitals

| Metric | Value | Status |
|--------|-------|--------|
| First Contentful Paint (FCP) | 0.3 s | Good |
| Largest Contentful Paint (LCP) | 0.9 s | Good |
| Total Blocking Time (TBT) | 210 ms | Needs Improvement |
| Cumulative Layout Shift (CLS) | 0.013 | Good |
| Speed Index | 0.7 s | Good |

## Key Findings

### Performance (92/100)
- Fast initial load with FCP at 0.3s
- Main content loads in under 1 second (LCP 0.9s)
- Minimal layout shift (CLS 0.013)
- TBT slightly above threshold (210ms vs 200ms target)

### SEO (100/100)
All SEO best practices implemented:
- Meta viewport and description present
- Document has proper title
- Mobile-friendly design
- Valid hreflang attributes

### Accessibility (90/100)
Strong accessibility foundation:
- Images have alt attributes
- Form elements have labels
- Proper document structure
- Good color contrast

### Best Practices (96/100)
Security and web standards:
- No deprecated APIs
- Console error-free
- Proper image aspect ratios

## Full Report

<a href="{{ '/assets/lighthouse-report.html' | relative_url }}" target="_blank" class="btn">View Full Lighthouse Report</a>

---

*Tested with Lighthouse 11.4.0 on 2025-12-30*
