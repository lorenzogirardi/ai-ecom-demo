/**
 * Spike Test
 *
 * Tests system behavior under sudden traffic spikes.
 * Validates auto-scaling and recovery capabilities.
 *
 * Usage: k6 run k6/scenarios/spike.js
 * Custom spike: k6 run -e SPIKE_VUS=300 k6/scenarios/spike.js
 */

import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { config, endpoints } from '../config.js';
import { httpGet, thinkTime, parseJson } from '../helpers/http.js';

// Custom metrics for spike analysis
const spikePhaseErrors = new Counter('spike_phase_errors');
const recoveryPhaseErrors = new Counter('recovery_phase_errors');
const normalPhaseLatency = new Trend('normal_phase_latency');
const spikePhaseLatency = new Trend('spike_phase_latency');
const recoveryPhaseLatency = new Trend('recovery_phase_latency');
const responseSuccess = new Rate('response_success');

// Spike configuration
const spikeVus = parseInt(__ENV.SPIKE_VUS) || 200;
const normalVus = 10;

export const options = {
  stages: [
    { duration: '30s', target: normalVus },   // Normal load baseline
    { duration: '10s', target: spikeVus },    // SPIKE! Rapid increase
    { duration: '1m', target: spikeVus },     // Stay at spike level
    { duration: '10s', target: normalVus },   // Rapid decrease
    { duration: '1m', target: normalVus },    // Recovery period
    { duration: '30s', target: 0 }            // Ramp down
  ],
  thresholds: {
    http_req_failed: ['rate<0.15'],           // Allow up to 15% errors during spike
    http_req_duration: ['p(95)<3000'],        // 95% < 3s (relaxed for spike)
    response_success: ['rate>0.85'],          // At least 85% success overall
    'normal_phase_latency': ['p(95)<500'],    // Normal phase should be fast
    'recovery_phase_latency': ['p(95)<1000'], // Recovery should return to normal
  }
};

// Determine current phase based on VU count
function getCurrentPhase() {
  const currentVUs = __VU;
  const iteration = __ITER;

  // Rough phase detection based on test progress
  // This is approximate - k6 doesn't expose stage info directly
  if (iteration < 5) return 'normal';
  if (currentVUs > normalVus * 5) return 'spike';
  return 'recovery';
}

// Track metrics by phase
function trackMetrics(response, phase) {
  const duration = response.timings.duration;
  const success = response.status < 400;

  responseSuccess.add(success);

  if (phase === 'normal') {
    normalPhaseLatency.add(duration);
  } else if (phase === 'spike') {
    spikePhaseLatency.add(duration);
    if (!success) spikePhaseErrors.add(1);
  } else {
    recoveryPhaseLatency.add(duration);
    if (!success) recoveryPhaseErrors.add(1);
  }
}

// Typical user actions during spike
function spikeUserBehavior() {
  const phase = getCurrentPhase();

  group('Spike Traffic', function () {
    // Health check - quick validation
    const healthRes = httpGet(endpoints.health, {
      tags: { name: 'spike-health', phase: phase },
      check: false
    });
    trackMetrics(healthRes, phase);
    check(healthRes, { 'health ok': (r) => r.status === 200 });

    // Product listing - main traffic target
    const productsRes = httpGet(endpoints.products, {
      tags: { name: 'spike-products', phase: phase },
      check: false
    });
    trackMetrics(productsRes, phase);
    check(productsRes, { 'products ok': (r) => r.status === 200 });

    // Random product view
    const products = parseJson(productsRes)?.data || [];
    if (products.length > 0) {
      const product = products[Math.floor(Math.random() * products.length)];
      const productRes = httpGet(endpoints.product(product.slug), {
        tags: { name: 'spike-product-detail', phase: phase },
        check: false
      });
      trackMetrics(productRes, phase);
      check(productRes, { 'product detail ok': (r) => r.status === 200 });
    }

    // Search - database intensive
    const searchRes = httpGet(`${endpoints.search}?q=laptop`, {
      tags: { name: 'spike-search', phase: phase },
      check: false
    });
    trackMetrics(searchRes, phase);
    check(searchRes, { 'search ok': (r) => r.status === 200 });
  });
}

export default function () {
  spikeUserBehavior();

  // Short think time to maintain high request rate during spike
  sleep(0.2 + Math.random() * 0.3);
}

// Detailed summary for spike analysis
export function handleSummary(data) {
  const metrics = data.metrics;

  console.log('\n=== SPIKE TEST ANALYSIS ===\n');

  // Phase comparison
  console.log('PHASE COMPARISON:');
  console.log('─'.repeat(50));

  if (metrics.normal_phase_latency) {
    const np = metrics.normal_phase_latency.values;
    console.log(`\nNormal Phase (baseline):`);
    console.log(`  p50: ${np['p(50)']?.toFixed(0) || 'N/A'}ms`);
    console.log(`  p95: ${np['p(95)']?.toFixed(0) || 'N/A'}ms`);
    console.log(`  p99: ${np['p(99)']?.toFixed(0) || 'N/A'}ms`);
  }

  if (metrics.spike_phase_latency) {
    const sp = metrics.spike_phase_latency.values;
    console.log(`\nSpike Phase (under load):`);
    console.log(`  p50: ${sp['p(50)']?.toFixed(0) || 'N/A'}ms`);
    console.log(`  p95: ${sp['p(95)']?.toFixed(0) || 'N/A'}ms`);
    console.log(`  p99: ${sp['p(99)']?.toFixed(0) || 'N/A'}ms`);
    if (metrics.spike_phase_errors) {
      console.log(`  Errors: ${metrics.spike_phase_errors.values.count}`);
    }
  }

  if (metrics.recovery_phase_latency) {
    const rp = metrics.recovery_phase_latency.values;
    console.log(`\nRecovery Phase:`);
    console.log(`  p50: ${rp['p(50)']?.toFixed(0) || 'N/A'}ms`);
    console.log(`  p95: ${rp['p(95)']?.toFixed(0) || 'N/A'}ms`);
    console.log(`  p99: ${rp['p(99)']?.toFixed(0) || 'N/A'}ms`);
    if (metrics.recovery_phase_errors) {
      console.log(`  Errors: ${metrics.recovery_phase_errors.values.count}`);
    }
  }

  // Overall stats
  console.log('\nOVERALL:');
  console.log('─'.repeat(50));
  if (metrics.http_reqs) {
    console.log(`Total Requests: ${metrics.http_reqs.values.count}`);
  }
  if (metrics.http_req_failed) {
    const failRate = metrics.http_req_failed.values.rate * 100;
    console.log(`Error Rate: ${failRate.toFixed(2)}%`);
  }
  if (metrics.response_success) {
    const successRate = metrics.response_success.values.rate * 100;
    console.log(`Success Rate: ${successRate.toFixed(2)}%`);
  }

  // Recovery assessment
  console.log('\nRECOVERY ASSESSMENT:');
  console.log('─'.repeat(50));
  if (metrics.normal_phase_latency && metrics.recovery_phase_latency) {
    const normalP95 = metrics.normal_phase_latency.values['p(95)'];
    const recoveryP95 = metrics.recovery_phase_latency.values['p(95)'];
    if (normalP95 && recoveryP95) {
      const degradation = ((recoveryP95 - normalP95) / normalP95 * 100);
      console.log(`Latency degradation after spike: ${degradation.toFixed(1)}%`);
      if (degradation < 20) {
        console.log(`Status: GOOD - System recovered well`);
      } else if (degradation < 50) {
        console.log(`Status: WARNING - Partial recovery`);
      } else {
        console.log(`Status: CRITICAL - Poor recovery`);
      }
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  return {
    'stdout': JSON.stringify(data, null, 2)
  };
}
