import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../config.js';

// Default headers
export const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Add auth header
export function authHeaders(token) {
  return {
    ...defaultHeaders,
    'Authorization': `Bearer ${token}`
  };
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

// Authenticated GET request
export function authGet(endpoint, token, params = {}) {
  return httpGet(endpoint, {
    ...params,
    headers: authHeaders(token)
  });
}

// Authenticated POST request
export function authPost(endpoint, body, token, params = {}) {
  return httpPost(endpoint, body, {
    ...params,
    headers: authHeaders(token)
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
