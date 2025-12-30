/**
 * Smoke Test
 *
 * Quick validation that the system works under minimal load.
 * Run this first to verify the system is healthy before heavier tests.
 *
 * Usage: k6 run k6/scenarios/smoke.js
 */

import { check, group, sleep } from 'k6';
import { config, endpoints } from '../config.js';
import { httpGet, httpPost, thinkTime, parseJson } from '../helpers/http.js';
import { loginAsUser } from '../helpers/auth.js';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],         // < 1% errors
    http_req_duration: ['p(95)<500'],        // 95% < 500ms
    'http_req_duration{name:health}': ['p(99)<200'],  // Health check fast
  }
};

export default function () {
  // Health check
  group('Health Check', function () {
    const res = httpGet(endpoints.health, { tags: { name: 'health' } });
    check(res, {
      'health status ok': (r) => parseJson(r)?.status === 'ok'
    });
  });

  thinkTime(0.5, 1);

  // Browse products
  group('Browse Products', function () {
    const res = httpGet(endpoints.products, { tags: { name: 'list-products' } });
    check(res, {
      'products returned': (r) => {
        const body = parseJson(r);
        return body?.data?.length > 0;
      }
    });
  });

  thinkTime(0.5, 1);

  // Browse categories
  group('Browse Categories', function () {
    const res = httpGet(endpoints.categories, { tags: { name: 'list-categories' } });
    check(res, {
      'categories returned': (r) => {
        const body = parseJson(r);
        return body?.data?.length > 0;
      }
    });
  });

  thinkTime(0.5, 1);

  // Search
  group('Search Products', function () {
    const res = httpGet(`${endpoints.search}?q=laptop`, { tags: { name: 'search' } });
    check(res, {
      'search results': (r) => r.status === 200
    });
  });

  thinkTime(0.5, 1);

  // Auth flow
  group('Authentication', function () {
    const token = loginAsUser('regular');
    check(token, {
      'login successful': (t) => t !== null
    });
  });

  sleep(1);
}
