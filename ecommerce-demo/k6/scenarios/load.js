/**
 * Load Test
 *
 * Tests normal expected load with realistic user journeys.
 * Simulates typical production traffic patterns.
 *
 * Usage: k6 run k6/scenarios/load.js
 * Custom VUs: k6 run -e VUS=100 k6/scenarios/load.js
 */

import { check, group, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';
import { config, endpoints } from '../config.js';
import { httpGet, authGet, authPost, thinkTime, parseJson } from '../helpers/http.js';
import { loginAsUser } from '../helpers/auth.js';

// Custom metrics
const productViews = new Counter('product_views');
const orderAttempts = new Counter('order_attempts');
const orderDuration = new Trend('order_creation_duration');

// Get max VUs from env or default
const maxVus = parseInt(__ENV.VUS) || 50;

export const options = {
  stages: [
    { duration: '2m', target: maxVus },      // Ramp up
    { duration: '5m', target: maxVus },      // Steady state
    { duration: '2m', target: 0 }            // Ramp down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],          // < 1% errors
    http_req_duration: ['p(95)<500'],        // 95% < 500ms
    'http_req_duration{name:list-products}': ['p(95)<300'],
    'http_req_duration{name:search}': ['p(95)<400'],
    product_views: ['count>100'],            // At least 100 product views
  }
};

// Simulate browsing user (70% of traffic)
function browsingUser() {
  group('Browsing Journey', function () {
    // View homepage/products
    httpGet(endpoints.products, { tags: { name: 'list-products' } });
    thinkTime(2, 4);

    // View categories
    httpGet(endpoints.categories, { tags: { name: 'list-categories' } });
    thinkTime(1, 2);

    // View specific product
    const productsRes = httpGet(endpoints.products, { check: false });
    const products = parseJson(productsRes)?.data || [];
    if (products.length > 0) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      httpGet(endpoints.product(randomProduct.slug), { tags: { name: 'view-product' } });
      productViews.add(1);
    }
    thinkTime(2, 5);

    // Search for something
    const searchTerms = ['laptop', 'phone', 'camera', 'headphones', 'watch'];
    const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    httpGet(`${endpoints.search}?q=${term}`, { tags: { name: 'search' } });
    thinkTime(1, 3);
  });
}

// Simulate authenticated user with purchase intent (30% of traffic)
function purchasingUser() {
  group('Purchase Journey', function () {
    // Login
    const token = loginAsUser('regular');
    if (!token) {
      console.error('Failed to login, aborting purchase journey');
      return;
    }
    thinkTime(1, 2);

    // Browse products
    const productsRes = authGet(endpoints.products, token, { tags: { name: 'auth-list-products' } });
    thinkTime(2, 4);

    // View user's existing orders
    authGet(endpoints.orders, token, { tags: { name: 'list-orders' } });
    thinkTime(1, 2);

    // Simulate order creation (10% of purchasing users actually order)
    if (Math.random() < 0.1) {
      const products = parseJson(productsRes)?.data || [];
      if (products.length > 0) {
        const product = products[Math.floor(Math.random() * products.length)];
        orderAttempts.add(1);

        const orderStart = Date.now();
        const orderRes = authPost(endpoints.orders, {
          items: [{ productId: product.id, quantity: 1 }],
          shippingAddress: {
            firstName: 'Load',
            lastName: 'Test',
            address1: '123 Test Street',
            city: 'Test City',
            state: 'TS',
            postalCode: '12345',
            country: 'Test Country'
          }
        }, token, { tags: { name: 'create-order' }, expectedStatus: 201 });

        orderDuration.add(Date.now() - orderStart);

        check(orderRes, {
          'order created': (r) => r.status === 201
        });
      }
    }
  });
}

export default function () {
  // 70% browsing, 30% purchasing intent
  if (Math.random() < 0.7) {
    browsingUser();
  } else {
    purchasingUser();
  }

  sleep(1);
}
