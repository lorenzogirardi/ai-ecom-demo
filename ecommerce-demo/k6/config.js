// k6 Configuration
// Environment-specific settings for load testing

export const config = {
  // Target URLs
  baseUrl: __ENV.BASE_URL || 'https://dls03qes9fc77.cloudfront.net',
  apiUrl: __ENV.API_URL || 'https://dls03qes9fc77.cloudfront.net/api',

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

// API Endpoints
export const endpoints = {
  // Health
  health: '/health',

  // Auth
  login: '/auth/login',
  register: '/auth/register',
  me: '/auth/me',

  // Catalog
  products: '/products',
  product: (slug) => `/products/${slug}`,
  categories: '/categories',
  category: (slug) => `/categories/${slug}`,

  // Search
  search: '/search',

  // Orders (authenticated)
  orders: '/orders',
  order: (id) => `/orders/${id}`,
  cancelOrder: (id) => `/orders/${id}/cancel`
};
