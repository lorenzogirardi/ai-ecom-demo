import http from 'k6/http';
import { check } from 'k6';
import { config, endpoints } from '../config.js';
import { defaultHeaders, parseJson } from './http.js';

// Login and return token
export function login(email, password) {
  const url = `${config.baseUrl}${endpoints.login}`;

  const response = http.post(url, JSON.stringify({ email, password }), {
    headers: defaultHeaders,
    tags: { name: 'login' }
  });

  const success = check(response, {
    'login successful': (r) => r.status === 200,
    'has token': (r) => {
      const body = parseJson(r);
      return body && body.data && body.data.token;
    }
  });

  if (success) {
    const body = parseJson(response);
    return body.data.token;
  }

  console.error(`Login failed: ${response.status} - ${response.body}`);
  return null;
}

// Login with test user credentials
export function loginAsUser(userType = 'regular') {
  const user = config.testUsers[userType];
  if (!user) {
    console.error(`Unknown user type: ${userType}`);
    return null;
  }
  return login(user.email, user.password);
}

// Get current user info (no spread operator for k6 compatibility)
export function getMe(token) {
  const url = config.baseUrl + endpoints.me;

  const response = http.get(url, {
    headers: Object.assign({}, defaultHeaders, {
      'Authorization': 'Bearer ' + token
    }),
    tags: { name: 'get-me' }
  });

  check(response, {
    'get me successful': (r) => r.status === 200
  });

  return parseJson(response);
}
