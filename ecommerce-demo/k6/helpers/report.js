/**
 * HTML Report Generator for k6
 * Generates a readable HTML report from k6 test results
 */

export function generateHtmlReport(data, testName = 'Load Test') {
  const metrics = data.metrics;
  const timestamp = new Date().toISOString();

  // Extract key metrics (compatible with k6 v0.49.0 - no optional chaining)
  const httpReqs = (metrics.http_reqs && metrics.http_reqs.values && metrics.http_reqs.values.count) || 0;
  const httpReqDuration = (metrics.http_req_duration && metrics.http_req_duration.values) || {};
  const httpReqFailed = (metrics.http_req_failed && metrics.http_req_failed.values && metrics.http_req_failed.values.rate) || 0;
  const iterations = (metrics.iterations && metrics.iterations.values && metrics.iterations.values.count) || 0;
  const dataReceived = (metrics.data_received && metrics.data_received.values && metrics.data_received.values.count) || 0;
  const dataSent = (metrics.data_sent && metrics.data_sent.values && metrics.data_sent.values.count) || 0;
  const vus = (metrics.vus && metrics.vus.values && metrics.vus.values.max) || 0;
  const duration = ((data.state && data.state.testRunDurationMs) || 0) / 1000;

  // Check results
  const checks = (data.root_group && data.root_group.checks) || [];
  const checkResults = [];

  function extractChecks(group, prefix = '') {
    if (group.checks) {
      for (const check of group.checks) {
        checkResults.push({
          name: prefix + check.name,
          passes: check.passes,
          fails: check.fails,
          rate: check.passes / (check.passes + check.fails) * 100
        });
      }
    }
    if (group.groups) {
      for (const subGroup of group.groups) {
        extractChecks(subGroup, prefix + subGroup.name + ' > ');
      }
    }
  }

  if (data.root_group) {
    extractChecks(data.root_group);
  }

  // Thresholds
  const thresholds = [];
  for (const [name, threshold] of Object.entries(data.metrics || {})) {
    if (threshold.thresholds) {
      for (const [condition, result] of Object.entries(threshold.thresholds)) {
        thresholds.push({
          metric: name,
          condition: condition,
          passed: result.ok
        });
      }
    }
  }

  const passedThresholds = thresholds.filter(t => t.passed).length;
  const failedThresholds = thresholds.filter(t => !t.passed).length;
  const overallStatus = failedThresholds === 0 ? 'PASSED' : 'FAILED';
  const statusColor = failedThresholds === 0 ? '#22c55e' : '#ef4444';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>k6 Report - ${testName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      line-height: 1.6;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
    }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .subtitle { opacity: 0.9; }
    .status-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 0.875rem;
      background: ${statusColor};
      color: white;
      margin-top: 1rem;
    }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .card-title { font-size: 0.875rem; color: #64748b; margin-bottom: 0.5rem; }
    .card-value { font-size: 2rem; font-weight: 700; color: #1e293b; }
    .card-unit { font-size: 0.875rem; color: #94a3b8; }
    section { margin-bottom: 2rem; }
    h2 { font-size: 1.25rem; margin-bottom: 1rem; color: #334155; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; font-weight: 600; color: #475569; }
    tr:last-child td { border-bottom: none; }
    .pass { color: #22c55e; }
    .fail { color: #ef4444; }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge-pass { background: #dcfce7; color: #166534; }
    .badge-fail { background: #fee2e2; color: #991b1b; }
    .progress-bar {
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 0.5rem;
    }
    .progress-fill { height: 100%; background: #22c55e; transition: width 0.3s; }
    .progress-fill.warning { background: #f59e0b; }
    .progress-fill.danger { background: #ef4444; }
    footer { text-align: center; color: #94a3b8; font-size: 0.875rem; margin-top: 2rem; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${testName}</h1>
      <p class="subtitle">Generated: ${timestamp}</p>
      <span class="status-badge">${overallStatus}</span>
    </header>

    <div class="grid">
      <div class="card">
        <div class="card-title">Total Requests</div>
        <div class="card-value">${httpReqs.toLocaleString()}</div>
        <div class="card-unit">${(httpReqs / duration).toFixed(1)} req/s</div>
      </div>
      <div class="card">
        <div class="card-title">Response Time (p95)</div>
        <div class="card-value">${(httpReqDuration['p(95)'] || 0).toFixed(0)}</div>
        <div class="card-unit">milliseconds</div>
      </div>
      <div class="card">
        <div class="card-title">Error Rate</div>
        <div class="card-value ${httpReqFailed > 0.01 ? 'fail' : 'pass'}">${(httpReqFailed * 100).toFixed(2)}%</div>
        <div class="card-unit">of requests failed</div>
      </div>
      <div class="card">
        <div class="card-title">Virtual Users</div>
        <div class="card-value">${vus}</div>
        <div class="card-unit">max concurrent</div>
      </div>
      <div class="card">
        <div class="card-title">Duration</div>
        <div class="card-value">${duration.toFixed(1)}</div>
        <div class="card-unit">seconds</div>
      </div>
      <div class="card">
        <div class="card-title">Iterations</div>
        <div class="card-value">${iterations.toLocaleString()}</div>
        <div class="card-unit">completed</div>
      </div>
    </div>

    <section>
      <h2>Response Time Distribution</h2>
      <div class="card">
        <table>
          <tr>
            <th>Percentile</th>
            <th>Response Time</th>
          </tr>
          <tr><td>Minimum</td><td>${(httpReqDuration.min || 0).toFixed(2)} ms</td></tr>
          <tr><td>Average</td><td>${(httpReqDuration.avg || 0).toFixed(2)} ms</td></tr>
          <tr><td>Median (p50)</td><td>${(httpReqDuration.med || 0).toFixed(2)} ms</td></tr>
          <tr><td>p90</td><td>${(httpReqDuration['p(90)'] || 0).toFixed(2)} ms</td></tr>
          <tr><td>p95</td><td>${(httpReqDuration['p(95)'] || 0).toFixed(2)} ms</td></tr>
          <tr><td>p99</td><td>${(httpReqDuration['p(99)'] || 0).toFixed(2)} ms</td></tr>
          <tr><td>Maximum</td><td>${(httpReqDuration.max || 0).toFixed(2)} ms</td></tr>
        </table>
      </div>
    </section>

    <section>
      <h2>Thresholds (${passedThresholds} passed, ${failedThresholds} failed)</h2>
      <div class="card">
        <table>
          <tr>
            <th>Metric</th>
            <th>Condition</th>
            <th>Status</th>
          </tr>
          ${thresholds.map(t => `
          <tr>
            <td>${t.metric}</td>
            <td><code>${t.condition}</code></td>
            <td><span class="badge ${t.passed ? 'badge-pass' : 'badge-fail'}">${t.passed ? 'PASS' : 'FAIL'}</span></td>
          </tr>
          `).join('')}
        </table>
      </div>
    </section>

    ${checkResults.length > 0 ? `
    <section>
      <h2>Checks</h2>
      <div class="card">
        <table>
          <tr>
            <th>Check</th>
            <th>Passes</th>
            <th>Fails</th>
            <th>Success Rate</th>
          </tr>
          ${checkResults.map(c => `
          <tr>
            <td>${c.name}</td>
            <td class="pass">${c.passes}</td>
            <td class="${c.fails > 0 ? 'fail' : ''}">${c.fails}</td>
            <td>
              ${c.rate.toFixed(1)}%
              <div class="progress-bar">
                <div class="progress-fill ${c.rate < 90 ? (c.rate < 50 ? 'danger' : 'warning') : ''}" style="width: ${c.rate}%"></div>
              </div>
            </td>
          </tr>
          `).join('')}
        </table>
      </div>
    </section>
    ` : ''}

    <section>
      <h2>Network</h2>
      <div class="grid">
        <div class="card">
          <div class="card-title">Data Received</div>
          <div class="card-value">${(dataReceived / 1024).toFixed(1)}</div>
          <div class="card-unit">KB</div>
        </div>
        <div class="card">
          <div class="card-title">Data Sent</div>
          <div class="card-value">${(dataSent / 1024).toFixed(1)}</div>
          <div class="card-unit">KB</div>
        </div>
      </div>
    </section>

    <footer>
      <p>Generated by k6 Load Testing • E-commerce Demo</p>
    </footer>
  </div>
</body>
</html>`;
}
