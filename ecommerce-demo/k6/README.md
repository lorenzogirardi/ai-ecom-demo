# k6 Load Testing

Load testing suite for the E-commerce Demo application using [k6](https://k6.io/).

## Prerequisites

Install k6:

```bash
# macOS
brew install k6

# Linux (Debian/Ubuntu)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Docker
docker pull grafana/k6
```

## Directory Structure

```
k6/
├── config.js           # Configuration and constants
├── helpers/
│   ├── http.js         # HTTP helper functions
│   └── auth.js         # Authentication helpers
├── scenarios/
│   ├── smoke.js        # Quick validation test
│   ├── load.js         # Normal load test
│   ├── stress.js       # Find breaking points
│   └── spike.js        # Sudden traffic spike test
└── README.md           # This file
```

## Test Scenarios

### 1. Smoke Test (smoke.js)

Quick validation that the system is working. Run this first.

```bash
k6 run k6/scenarios/smoke.js
```

- **VUs:** 5
- **Duration:** 30 seconds
- **Purpose:** Validate system health before heavier tests

### 2. Load Test (load.js)

Simulates normal expected traffic with realistic user journeys.

```bash
# Default (50 VUs)
k6 run k6/scenarios/load.js

# Custom VUs
k6 run -e VUS=100 k6/scenarios/load.js
```

- **Stages:** Ramp up → Steady → Ramp down
- **Duration:** ~9 minutes
- **User Mix:** 70% browsing, 30% purchasing intent

### 3. Stress Test (stress.js)

Pushes the system beyond normal limits to identify bottlenecks.

```bash
# Default (up to 200 VUs)
k6 run k6/scenarios/stress.js

# Extended stress
k6 run -e MAX_VUS=300 k6/scenarios/stress.js
```

- **Stages:** Gradual increase to breaking point
- **Duration:** ~13 minutes
- **Metrics:** Saturation analysis, error rates by endpoint

### 4. Spike Test (spike.js)

Tests system behavior under sudden traffic spikes.

```bash
# Default (spike to 200 VUs)
k6 run k6/scenarios/spike.js

# Higher spike
k6 run -e SPIKE_VUS=300 k6/scenarios/spike.js
```

- **Pattern:** Normal → Spike → Sustain → Drop → Recovery
- **Duration:** ~4 minutes
- **Analysis:** Phase comparison, recovery assessment

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | CloudFront URL | Base URL for tests |
| `API_URL` | CloudFront /api | API endpoint URL |
| `VUS` | varies | Max virtual users |
| `MAX_VUS` | 200 | Max VUs for stress test |
| `SPIKE_VUS` | 200 | Spike target VUs |

Example with custom URL:

```bash
k6 run -e BASE_URL=http://localhost:3000 -e API_URL=http://localhost:4000/api k6/scenarios/smoke.js
```

## Thresholds (SLOs)

Default service level objectives:

| Metric | Smoke | Load | Stress | Spike |
|--------|-------|------|--------|-------|
| Error Rate | <1% | <1% | <10% | <15% |
| p95 Latency | <500ms | <500ms | <2000ms | <3000ms |
| p99 Latency | <1000ms | - | - | - |

## Output Options

### Console (default)

```bash
k6 run k6/scenarios/load.js
```

### JSON output

```bash
k6 run --out json=results.json k6/scenarios/load.js
```

### InfluxDB (for Grafana dashboards)

```bash
k6 run --out influxdb=http://localhost:8086/k6 k6/scenarios/load.js
```

### Datadog

```bash
K6_DATADOG_API_KEY=<your-api-key> k6 run --out datadog k6/scenarios/load.js
```

## Recommended Test Order

1. **Smoke** - Verify system is healthy
2. **Load** - Establish baseline performance
3. **Stress** - Find breaking points
4. **Spike** - Validate auto-scaling/recovery

## Interpreting Results

### Key Metrics

- **http_req_duration**: Response time distribution
- **http_reqs**: Requests per second
- **http_req_failed**: Error rate
- **iterations**: Completed test iterations

### Performance Indicators

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| p95 latency | <500ms | 500-1000ms | >1000ms |
| Error rate | <1% | 1-5% | >5% |
| Throughput | Stable | Degrading | Collapsing |

### Saturation Signs

- Response times increasing non-linearly
- Error rates climbing
- Throughput plateau or decline
- Connection errors appearing

## Integration with Monitoring

During load tests, correlate with:

- **CloudWatch**: EKS CPU/Memory, RDS connections, ElastiCache hits
- **kubectl**: Pod status, HPA scaling events
- **Application logs**: Error patterns, slow queries

### Useful kubectl commands during tests

```bash
# Watch pod scaling
kubectl get pods -n ecommerce -w

# Watch HPA
kubectl get hpa -n ecommerce -w

# Check resource usage
kubectl top pods -n ecommerce
```

## Troubleshooting

### Connection refused

- Verify target URL is accessible
- Check security groups allow traffic
- Verify pods are running

### High error rates

- Check backend logs: `kubectl logs -n ecommerce deployment/backend`
- Verify database connections: Check RDS metrics
- Check Redis: Verify ElastiCache connection

### Timeouts

- Increase k6 timeout if needed
- Check ALB target health
- Verify no rate limiting is active
