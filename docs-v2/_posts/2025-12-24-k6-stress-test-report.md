---
layout: post
title: "k6 Stress Test Report - Day 8"
date: 2025-12-24
category: technical
order: 12
reading_time: 5
tags: [k6, load-testing, performance, stress-test, optimization]
excerpt: "Day 8 stress test results after code optimizations. 216K requests, 277 RPS, p95 190ms, 0% error rate, all checks passed."
takeaway: "Code optimizations (Redis pipeline, user caching) achieved 0% error rate and 50% latency reduction vs Day 6."
---

## Test Summary

k6 stress test performed on Day 8 after code optimizations.

| Metric | Value |
|--------|-------|
| Total Requests | 216,375 |
| Requests/sec | 277.2 |
| Response Time (p95) | 190 ms |
| Error Rate | 0.00% |
| Virtual Users | 100 max |
| Duration | 780.6 seconds (~13 min) |
| Iterations | 56,957 |

**Status: PASSED**

## Response Time Distribution

| Percentile | Response Time |
|------------|---------------|
| Minimum | 109.50 ms |
| Average | 130.34 ms |
| Median (p50) | 117.87 ms |
| p90 | 166.29 ms |
| p95 | 189.62 ms |
| Maximum | 2105.21 ms |

## Thresholds

All 4 thresholds passed:

| Metric | Condition | Status |
|--------|-----------|--------|
| requests_under_1s | rate > 0.8 | PASS |
| http_req_duration | p(95) < 2000 | PASS |
| http_req_failed | rate < 0.10 | PASS |
| requests_under_500ms | rate > 0.5 | PASS |

## Checks (100% Pass Rate)

### Auth Stress Tests
- login successful: 11,453 passes
- has token: 11,453 passes
- orders ok: 11,453 passes
- me ok: 11,453 passes

### API Stress Tests
- health ok: 45,504 passes
- products ok: 45,504 passes
- categories ok: 45,504 passes
- search ok: 45,504 passes

## Performance Evolution

| Metric | Day 6 | Day 7 | Day 8 | Improvement |
|--------|-------|-------|-------|-------------|
| p95 Latency | 380 ms | 206 ms | 190 ms | **-50%** |
| Error Rate | 5.33% | 5.27% | 0.00% | **-100%** |
| RPS | 234.8 | 373.4 | 277.2 | +18% |

## Optimizations Applied

| Optimization | Impact |
|--------------|--------|
| Redis pipeline (mget/mset) | Batch operations for products |
| User caching for /me | Reduced database queries |
| Cache hit rate | 99.95% (33,845 hits, 18 misses) |

## Conclusion

The Day 8 stress test demonstrates significant improvements from code-level optimizations:

- **Zero errors**: Down from 5.33% on Day 6
- **50% latency reduction**: p95 from 380ms to 190ms
- **99.95% cache hit rate**: Excellent Redis utilization
- **All checks passed**: 100% success rate on all endpoints
