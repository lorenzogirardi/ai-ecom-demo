# Report Scansione Sicurezza ZAP Baseline

**Sito:** https://dls03qes9fc77.cloudfront.net
**Generato:** 3 Gennaio 2026
**Versione ZAP:** 2.17.0
**Scansione di:** [Checkmarx](https://checkmarx.com/)

---

## Riepilogo Alert

| Livello Rischio | Numero Alert |
|-----------------|--------------|
| High | 0 |
| Medium | 4 |
| Low | 6 |
| Informational | 11 |
| Falsi Positivi | 0 |

---

## Insights

| Livello | Descrizione | Valore |
|---------|-------------|--------|
| Info | Endpoint totali scansionati | 88 |
| Info | Risposte con status 2xx | 95% |
| Info | Risposte con status 3xx | 2% |
| Info | Risposte con status 4xx | 2% |
| Info | Risposte con status 5xx | 1% |
| Info | Risposte lente | 1% |
| Warning | Warning ZAP registrati | 3 |

### Distribuzione Content Types

| Content Type | Percentuale |
|--------------|-------------|
| text/x-component | 32% |
| application/javascript | 23% |
| application/json | 17% |
| text/html | 15% |
| text/css | 3% |
| image/png | 2% |
| font/woff2 | 1% |
| image/avif | 1% |

---

## Alert

| Nome | Livello Rischio | Istanze |
|------|-----------------|---------|
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

## Dettaglio Alert

### Alert Rischio Medium

#### CSP: Wildcard Directive

**Descrizione:** Content Security Policy (CSP) è un livello aggiuntivo di sicurezza che aiuta a rilevare e mitigare certi tipi di attacchi inclusi Cross Site Scripting (XSS) e attacchi di data injection.

**URL:** `/api/docs/static/index.html`
**Parametro:** `Content-Security-Policy`
**Problema:** La direttiva `img-src` permette sorgenti wildcard.

**Soluzione:** Assicurarsi che il web server sia configurato correttamente per impostare l'header Content-Security-Policy con direttive restrittive.

---

#### CSP: style-src unsafe-inline

**Descrizione:** L'header CSP contiene `style-src 'unsafe-inline'` che permette stili inline.

**URL:** `/api/docs/static/index.html`
**Problema:** `style-src` include `unsafe-inline`, richiesto da Swagger UI.

**Soluzione:** Considerare l'uso di nonces o hash per gli stili inline dove possibile.

---

#### Content Security Policy (CSP) Header Not Set

**Descrizione:** L'header CSP è mancante sulle pagine frontend.

**URL interessati:**
- `/` (homepage)
- `/cart`
- `/sitemap.xml`

**Soluzione:** Configurare il web server per impostare l'header Content-Security-Policy su tutte le risposte.

---

#### Vulnerable JS Library

**Descrizione:** La libreria identificata risulta vulnerabile.

**URL:** `/api/docs/static/swagger-ui-bundle.js`
**Libreria:** DOMPurify versione 3.1.4
**CVE:** CVE-2025-26791

**Soluzione:** Aggiornare a DOMPurify 3.2.4 o successivo aggiornando `@fastify/swagger-ui`.

---

### Alert Rischio Low

#### Insufficient Site Isolation Against Spectre Vulnerability

**Descrizione:** Header Cross-Origin-Resource-Policy, Cross-Origin-Embedder-Policy e Cross-Origin-Opener-Policy mancanti.

**Istanze:** 12
**Soluzione:** Impostare gli header CORP/COEP/COOP appropriati per mitigare vulnerabilità di classe Spectre.

---

#### Permissions Policy Header Not Set

**Descrizione:** L'header Permissions Policy restringe le funzionalità del browser disponibili per la pagina.

**Soluzione:** Configurare l'header Permissions-Policy per restringere l'accesso a funzionalità sensibili come camera, microfono, geolocalizzazione.

---

#### Server Leaks Information via "X-Powered-By" Header

**Descrizione:** Gli header di risposta espongono `X-Powered-By: Next.js`.

**Soluzione:** Configurare Next.js per sopprimere l'header X-Powered-By:
```javascript
// next.config.js
poweredByHeader: false
```

---

#### Server Leaks Version Information via "Server" Header

**Descrizione:** Gli header di risposta espongono `Server: awselb/2.0`.

**Soluzione:** Questo è controllato da AWS ALB e non può essere facilmente soppresso.

---

#### Strict-Transport-Security Header Not Set

**Descrizione:** L'header HSTS è mancante, il che potrebbe permettere attacchi downgrade.

**Soluzione:** Aggiungere l'header HSTS con max-age appropriato:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

#### Timestamp Disclosure - Unix

**Descrizione:** Timestamp Unix trovati nei file JavaScript di Swagger UI.

**Soluzione:** Rischio basso - verificare se i timestamp contengono informazioni sensibili.

---

## Riferimenti

- [OWASP ZAP](https://www.zaproxy.org/)
- [Content Security Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/)

---

*Report generato da OWASP ZAP 2.17.0*
