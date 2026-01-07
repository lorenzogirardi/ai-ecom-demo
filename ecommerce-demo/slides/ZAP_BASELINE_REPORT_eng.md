# ZAP Baseline Security Scan Report

**Site:** https://dls03qes9fc77.cloudfront.net
**Generated:** January 3, 2026
**ZAP Version:** 2.17.0
**Scan by:** [Checkmarx](https://checkmarx.com/)

---

## Summary of Alerts

| Risk Level | Number of Alerts |
|------------|------------------|
| High | 0 |
| Medium | 4 |
| Low | 6 |
| Informational | 11 |
| False Positives | 0 |

---

## Insights

| Level | Description | Value |
|-------|-------------|-------|
| Info | Total endpoints scanned | 88 |
| Info | Responses with status 2xx | 95% |
| Info | Responses with status 3xx | 2% |
| Info | Responses with status 4xx | 2% |
| Info | Responses with status 5xx | 1% |
| Info | Slow responses | 1% |
| Warning | ZAP warnings logged | 3 |

### Content Types Distribution

| Content Type | Percentage |
|--------------|------------|
| text/x-component | 32% |
| application/javascript | 23% |
| application/json | 17% |
| text/html | 15% |
| text/css | 3% |
| image/png | 2% |
| font/woff2 | 1% |
| image/avif | 1% |

---

## Alerts

| Name | Risk Level | Instances |
|------|------------|-----------|
| CSP: Wildcard Directive | Medium | 1 |
| CSP: style-src unsafe-inline | Medium | 1 |
| Content Security Policy (CSP) Header Not Set | Medium | Systemic |
| Vulnerable JS Library | Medium | 1 |
| Insufficient Site Isolation Against Spectre Vulnerability | Low | 12 |
| Permissions Policy Header Not Set | Low | Systemic |
| Server Leaks Information via "X-Powered-By" Header | Low | Systemic |
| Server Leaks Version Information via "Server" Header | Low | Systemic |
| Strict-Transport-Security Header Not Set | Low | Systemic |
| Timestamp Disclosure - Unix | Low | Systemic |
| Base64 Disclosure | Informational | 12 |
| Content-Type Header Missing | Informational | 1 |
| Information Disclosure - Suspicious Comments | Informational | 12 |
| Modern Web Application | Informational | Systemic |
| Non-Storable Content | Informational | 2 |
| Re-examine Cache-control Directives | Informational | Systemic |
| Sec-Fetch-Dest Header is Missing | Informational | 3 |
| Sec-Fetch-Mode Header is Missing | Informational | 3 |
| Sec-Fetch-Site Header is Missing | Informational | 3 |
| Sec-Fetch-User Header is Missing | Informational | 3 |
| Storable and Cacheable Content | Informational | Systemic |

---

## Alert Details

### Medium Risk Alerts

#### CSP: Wildcard Directive

**Description:** Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks including Cross Site Scripting (XSS) and data injection attacks.

**URL:** `/api/docs/static/index.html`
**Parameter:** `Content-Security-Policy`
**Issue:** The `img-src` directive allows wildcard sources.

**Solution:** Ensure that your web server is properly configured to set the Content-Security-Policy header with restricted directives.

---

#### CSP: style-src unsafe-inline

**Description:** The CSP header contains `style-src 'unsafe-inline'` which allows inline styles.

**URL:** `/api/docs/static/index.html`
**Issue:** `style-src` includes `unsafe-inline`, required by Swagger UI.

**Solution:** Consider using nonces or hashes for inline styles where possible.

---

#### Content Security Policy (CSP) Header Not Set

**Description:** CSP header is missing on frontend pages.

**Affected URLs:**
- `/` (homepage)
- `/cart`
- `/sitemap.xml`

**Solution:** Configure web server to set Content-Security-Policy header on all responses.

---

#### Vulnerable JS Library

**Description:** The identified library appears to be vulnerable.

**URL:** `/api/docs/static/swagger-ui-bundle.js`
**Library:** DOMPurify version 3.1.4
**CVE:** CVE-2025-26791

**Solution:** Upgrade to DOMPurify 3.2.4 or later by updating `@fastify/swagger-ui`.

---

### Low Risk Alerts

#### Insufficient Site Isolation Against Spectre Vulnerability

**Description:** Missing Cross-Origin-Resource-Policy, Cross-Origin-Embedder-Policy, and Cross-Origin-Opener-Policy headers.

**Instances:** 12
**Solution:** Set appropriate CORP/COEP/COOP headers to mitigate Spectre-class vulnerabilities.

---

#### Permissions Policy Header Not Set

**Description:** Permissions Policy Header restricts browser features available to the page.

**Solution:** Configure Permissions-Policy header to restrict access to sensitive features like camera, microphone, geolocation.

---

#### Server Leaks Information via "X-Powered-By" Header

**Description:** Response headers leak `X-Powered-By: Next.js`.

**Solution:** Configure Next.js to suppress X-Powered-By header:
```javascript
// next.config.js
poweredByHeader: false
```

---

#### Server Leaks Version Information via "Server" Header

**Description:** Response headers leak `Server: awselb/2.0`.

**Solution:** This is controlled by AWS ALB and cannot be easily suppressed.

---

#### Strict-Transport-Security Header Not Set

**Description:** HSTS header is missing, which could allow downgrade attacks.

**Solution:** Add HSTS header with appropriate max-age:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

#### Timestamp Disclosure - Unix

**Description:** Unix timestamps found in Swagger UI JavaScript files.

**Solution:** Low risk - review if timestamps contain sensitive information.

---

## References

- [OWASP ZAP](https://www.zaproxy.org/)
- [Content Security Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/)

---

*Report generated by OWASP ZAP 2.17.0*
