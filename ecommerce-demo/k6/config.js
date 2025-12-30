// k6 Configuration
// Environment-specific settings for load testing

export const config = {
  // Target URLs
  baseUrl: __ENV.BASE_URL || 'https://dls03qes9fc77.cloudfront.net',
  apiUrl: __ENV.API_URL || 'https://dls03qes9fc77.cloudfront.net/api',

  // Rate limit bypass token (must match backend RATE_LIMIT_BYPASS_TOKEN)
  rateLimitBypassToken: __ENV.RATE_LIMIT_BYPASS_TOKEN || 'k6-load-test-bypass-token-2025',

  // Test users (from seed data)
  testUsers: {
    admin: {
      email: 'admin@example.com',
      password: 'password123'
    },
    regular: {
      email: 'john@example.com',
      password: 'password123'
    },
    secondary: {
      email: 'jane@example.com',
      password: 'password123'
    }
  },

  // Thresholds (SLOs)
  thresholds: {
    // Response time
    http_req_duration_p95: 500,  // 95th percentile < 500ms
    http_req_duration_p99: 1000, // 99th percentile < 1000ms

    // Error rate
    http_req_failed_rate: 0.01,  // < 1% errors

    // Throughput (requests per second)
    // Varies by test type
  },

  // Test scenarios default settings
  scenarios: {
    smoke: {
      vus: 5,
      duration: '30s'
    },
    load: {
      stages: [
        { duration: '2m', target: 50 },   // Ramp up
        { duration: '5m', target: 50 },   // Steady state
        { duration: '2m', target: 0 }     // Ramp down
      ]
    },
    stress: {
      stages: [
        { duration: '2m', target: 50 },   // Ramp up to normal
        { duration: '3m', target: 100 },  // Push higher
        { duration: '3m', target: 150 },  // Push limits
        { duration: '3m', target: 200 },  // Breaking point
        { duration: '2m', target: 0 }     // Recovery
      ]
    },
    spike: {
      stages: [
        { duration: '30s', target: 10 },  // Normal load
        { duration: '10s', target: 200 }, // Spike!
        { duration: '1m', target: 200 },  // Stay at spike
        { duration: '10s', target: 10 },  // Scale down
        { duration: '1m', target: 10 },   // Recovery
        { duration: '30s', target: 0 }    // Ramp down
      ]
    },
    soak: {
      stages: [
        { duration: '2m', target: 50 },   // Ramp up
        { duration: '30m', target: 50 },  // Long duration
        { duration: '2m', target: 0 }     // Ramp down
      ]
    }
  }
};

// API Endpoints (full paths from baseUrl)
export const endpoints = {
  // Health - use products endpoint as health check (actual /health not exposed via CloudFront)
  health: '/api/catalog/products?limit=1',

  // Auth
  login: '/api/auth/login',
  register: '/api/auth/register',
  me: '/api/auth/me',

  // Catalog
  products: '/api/catalog/products',
  product: (slug) => `/api/catalog/products/${slug}`,
  categories: '/api/catalog/categories',
  category: (slug) => `/api/catalog/categories/${slug}`,

  // Search
  search: '/api/search',

  // Orders (authenticated)
  orders: '/api/orders',
  order: (id) => `/api/orders/${id}`,
  cancelOrder: (id) => `/api/orders/${id}/cancel`
};
