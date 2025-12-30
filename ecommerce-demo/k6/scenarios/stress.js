/**
 * Stress Test
 *
 * Pushes the system beyond normal load to find breaking points.
 * Identifies bottlenecks and system limits.
 *
 * Usage: k6 run k6/scenarios/stress.js
 * Extended: k6 run -e MAX_VUS=300 k6/scenarios/stress.js
 */

import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { config, endpoints } from '../config.js';
import { httpGet, authGet, thinkTime, parseJson } from '../helpers/http.js';
import { loginAsUser } from '../helpers/auth.js';

// Custom metrics for stress analysis
const requestsUnder500ms = new Rate('requests_under_500ms');
const requestsUnder1s = new Rate('requests_under_1s');
const errorsByEndpoint = new Counter('errors_by_endpoint');
const saturationPoint = new Trend('saturation_requests_per_second');

// Max VUs configurable
const maxVus = parseInt(__ENV.MAX_VUS) || 200;

export const options = {
  stages: [
    { duration: '2m', target: 50 },          // Normal load
    { duration: '3m', target: 100 },         // Push higher
    { duration: '3m', target: Math.floor(maxVus * 0.75) },  // Push limits
    { duration: '3m', target: maxVus },      // Breaking point
    { duration: '2m', target: 0 }            // Recovery
  ],
  thresholds: {
    http_req_failed: ['rate<0.10'],          // Allow up to 10% errors in stress
    http_req_duration: ['p(95)<2000'],       // 95% < 2s under stress
    requests_under_500ms: ['rate>0.5'],      // At least 50% under 500ms
    requests_under_1s: ['rate>0.8'],         // At least 80% under 1s
  }
};

// Track response times for saturation analysis
function trackResponseTime(response, endpoint) {
  const duration = response.timings.duration;
  requestsUnder500ms.add(duration < 500);
  requestsUnder1s.add(duration < 1000);

  if (response.status >= 400) {
    errorsByEndpoint.add(1, { endpoint: endpoint });
  }
}

// High-frequency API calls
function apiStress() {
  group('API Stress', function () {
    // Health check (should always be fast)
    const healthRes = httpGet(endpoints.health, {
      tags: { name: 'stress-health' },
      check: false
    });
    trackResponseTime(healthRes, 'health');
    check(healthRes, { 'health ok': (r) => r.status === 200 });

    // Products listing (database + cache)
    const productsRes = httpGet(endpoints.products, {
      tags: { name: 'stress-products' },
      check: false
    });
    trackResponseTime(productsRes, 'products');
    check(productsRes, { 'products ok': (r) => r.status === 200 });

    // Categories (should be cached)
    const categoriesRes = httpGet(endpoints.categories, {
      tags: { name: 'stress-categories' },
      check: false
    });
    trackResponseTime(categoriesRes, 'categories');
    check(categoriesRes, { 'categories ok': (r) => r.status === 200 });

    // Search (more expensive query)
    const searchTerms = ['a', 'e', 'laptop', 'phone', 'test'];
    const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    const searchRes = httpGet(`${endpoints.search}?q=${term}`, {
      tags: { name: 'stress-search' },
      check: false
    });
    trackResponseTime(searchRes, 'search');
    check(searchRes, { 'search ok': (r) => r.status === 200 });
  });
}

// Authenticated operations (more resource intensive)
function authStress() {
  group('Auth Stress', function () {
    // Login attempts
    const token = loginAsUser('regular');
    if (!token) {
      errorsByEndpoint.add(1, { endpoint: 'login' });
      return;
    }

    // Fetch user's orders
    const ordersRes = authGet(endpoints.orders, token, {
      tags: { name: 'stress-orders' },
      check: false
    });
    trackResponseTime(ordersRes, 'orders');
    check(ordersRes, { 'orders ok': (r) => r.status === 200 });

    // Fetch user profile
    const meRes = authGet('/auth/me', token, {
      tags: { name: 'stress-me' },
      check: false
    });
    trackResponseTime(meRes, 'me');
    check(meRes, { 'me ok': (r) => r.status === 200 });
  });
}

export default function () {
  // 80% API stress, 20% auth stress (auth is more expensive)
  if (Math.random() < 0.8) {
    apiStress();
  } else {
    authStress();
  }

  // Minimal think time to maximize stress
  sleep(0.1 + Math.random() * 0.2);
}

// Summary handler for saturation analysis
export function handleSummary(data) {
  const metrics = data.metrics;

  console.log('\n=== STRESS TEST SATURATION ANALYSIS ===\n');

  // Request rate at each stage
  if (metrics.http_reqs) {
    const totalRequests = metrics.http_reqs.values.count;
    const duration = data.state.testRunDurationMs / 1000;
    const avgRps = totalRequests / duration;
    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Test Duration: ${duration.toFixed(1)}s`);
    console.log(`Average RPS: ${avgRps.toFixed(1)}`);
  }

  // Response time breakdown
  if (metrics.http_req_duration) {
    const p50 = metrics.http_req_duration.values['p(50)'];
    const p95 = metrics.http_req_duration.values['p(95)'];
    const p99 = metrics.http_req_duration.values['p(99)'];
    console.log(`\nResponse Times:`);
    console.log(`  p50: ${p50?.toFixed(0) || 'N/A'}ms`);
    console.log(`  p95: ${p95?.toFixed(0) || 'N/A'}ms`);
    console.log(`  p99: ${p99?.toFixed(0) || 'N/A'}ms`);
  }

  // Error analysis
  if (metrics.http_req_failed) {
    const failRate = metrics.http_req_failed.values.rate * 100;
    console.log(`\nError Rate: ${failRate.toFixed(2)}%`);
  }

  // Performance degradation
  if (metrics.requests_under_500ms) {
    const under500 = metrics.requests_under_500ms.values.rate * 100;
    console.log(`Requests <500ms: ${under500.toFixed(1)}%`);
  }
  if (metrics.requests_under_1s) {
    const under1s = metrics.requests_under_1s.values.rate * 100;
    console.log(`Requests <1s: ${under1s.toFixed(1)}%`);
  }

  console.log('\n========================================\n');

  return {
    'stdout': JSON.stringify(data, null, 2)
  };
}
