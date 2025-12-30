import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../config.js';

// Default headers (includes rate limit bypass for load testing)
export const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Load-Test-Bypass': config.rateLimitBypassToken
};

// Add auth header (no spread operator for k6 compatibility)
export function authHeaders(token) {
  return Object.assign({}, defaultHeaders, {
    'Authorization': 'Bearer ' + token
  });
}

// GET request with standard checks
export function httpGet(endpoint, params = {}) {
  const url = `${config.baseUrl}${endpoint}`;
  const response = http.get(url, {
    headers: params.headers || defaultHeaders,
    tags: params.tags || {}
  });

  if (params.check !== false) {
    check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500
    });
  }

  return response;
}

// POST request with standard checks
export function httpPost(endpoint, body, params = {}) {
  const url = `${config.baseUrl}${endpoint}`;
  const response = http.post(url, JSON.stringify(body), {
    headers: params.headers || defaultHeaders,
    tags: params.tags || {}
  });

  if (params.check !== false) {
    const expectedStatus = params.expectedStatus || 200;
    check(response, {
      [`status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
      'response time < 500ms': (r) => r.timings.duration < 500
    });
  }

  return response;
}

// Authenticated GET request (no spread operator for k6 compatibility)
export function authGet(endpoint, token, params) {
  var opts = params || {};
  return httpGet(endpoint, {
    headers: authHeaders(token),
    tags: opts.tags || {},
    check: opts.check
  });
}

// Authenticated POST request (no spread operator for k6 compatibility)
export function authPost(endpoint, body, token, params) {
  var opts = params || {};
  return httpPost(endpoint, body, {
    headers: authHeaders(token),
    tags: opts.tags || {},
    check: opts.check,
    expectedStatus: opts.expectedStatus
  });
}

// Random think time (simulates user behavior)
export function thinkTime(min = 1, max = 3) {
  sleep(Math.random() * (max - min) + min);
}

// Parse JSON response safely
export function parseJson(response) {
  try {
    return JSON.parse(response.body);
  } catch (e) {
    console.error(`Failed to parse JSON: ${e.message}`);
    return null;
  }
}
