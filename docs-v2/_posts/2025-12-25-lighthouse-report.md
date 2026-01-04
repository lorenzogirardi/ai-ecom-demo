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

<div class="lighthouse-embed">
  <iframe src="{{ '/assets/lighthouse-report.html' | relative_url }}" width="100%" height="800" frameborder="0"></iframe>
</div>

<style>
.lighthouse-embed {
  margin: 0 -2rem;
  width: calc(100% + 4rem);
}
.lighthouse-embed iframe {
  border: 1px solid var(--border-color, #30363d);
  border-radius: 8px;
}
@media (max-width: 768px) {
  .lighthouse-embed {
    margin: 0 -1rem;
    width: calc(100% + 2rem);
  }
}
</style>

<p style="text-align: center; margin-top: 1rem;">
  <a href="{{ '/assets/lighthouse-report.html' | relative_url }}" target="_blank">Open full report in new tab</a>
</p>
