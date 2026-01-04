# Report Scansione ZAP

ZAP di [Checkmarx](https://checkmarx.com/).

## Riepilogo Alert

| Livello Rischio | Numero Alert |
|-----------------|--------------|
| Alto | 0 |
| Medio | 4 |
| Basso | 6 |
| Informativo | 11 |

## Approfondimenti

| Livello | Motivo | Sito | Descrizione | Statistica |
|---------|--------|------|-------------|------------|
| Basso | Warning | | Avvisi ZAP registrati - vedere file zap.log per dettagli | 3 |
| Info | Informativo | https://dls03qes9fc77.cloudfront.net | Percentuale risposte con codice stato 2xx | 95% |
| Info | Informativo | https://dls03qes9fc77.cloudfront.net | Percentuale risposte con codice stato 3xx | 2% |
| Info | Informativo | https://dls03qes9fc77.cloudfront.net | Percentuale risposte con codice stato 4xx | 2% |
| Info | Informativo | https://dls03qes9fc77.cloudfront.net | Percentuale risposte con codice stato 5xx | 1% |
| Info | Informativo | https://dls03qes9fc77.cloudfront.net | Conteggio endpoint totali | 88 |
| Info | Informativo | https://dls03qes9fc77.cloudfront.net | Percentuale risposte lente | 1% |

## Alert

| Nome | Livello Rischio | Numero Istanze |
|------|-----------------|----------------|
| CSP: Direttiva Wildcard | Medio | 1 |
| CSP: style-src unsafe-inline | Medio | 1 |
| Header Content Security Policy (CSP) Non Impostato | Medio | Sistemico |
| Libreria JS Vulnerabile | Medio | 1 |
| Isolamento Sito Insufficiente Contro Vulnerabilità Spectre | Basso | 12 |
| Header Permissions Policy Non Impostato | Basso | Sistemico |
| Server Espone Informazioni via Header "X-Powered-By" | Basso | Sistemico |
| Server Espone Versione via Header "Server" | Basso | Sistemico |
| Header Strict-Transport-Security Non Impostato | Basso | Sistemico |
| Divulgazione Timestamp - Unix | Basso | Sistemico |
| Divulgazione Base64 | Informativo | 12 |
| Header Content-Type Mancante | Informativo | 1 |
| Divulgazione Informazioni - Commenti Sospetti | Informativo | 12 |
| Applicazione Web Moderna | Informativo | Sistemico |
| Contenuto Non Memorizzabile | Informativo | 2 |
| Riesaminare Direttive Cache-control | Informativo | Sistemico |
| Header Sec-Fetch-Dest Mancante | Informativo | 3 |
| Header Sec-Fetch-Mode Mancante | Informativo | 3 |
| Header Sec-Fetch-Site Mancante | Informativo | 3 |
| Header Sec-Fetch-User Mancante | Informativo | 3 |
| Contenuto Memorizzabile e Cacheable | Informativo | Sistemico |

## Dettaglio Alert

### CSP: Direttiva Wildcard

##### Medio (Alto)

**Descrizione:** Content Security Policy (CSP) è un livello di sicurezza aggiuntivo che aiuta a rilevare e mitigare certi tipi di attacchi, inclusi Cross Site Scripting (XSS) e attacchi di injection dati.

* URL: `https://dls03qes9fc77.cloudfront.net/api/docs/static/index.html`
* Parametro: `Content-Security-Policy`
* Altra Info: `img-src permette sorgenti wildcard`

**Soluzione:** Assicurarsi che il web server sia configurato correttamente per impostare l'header Content-Security-Policy.

---

### CSP: style-src unsafe-inline

##### Medio (Alto)

**Descrizione:** style-src include unsafe-inline, permettendo stili inline che potrebbero essere sfruttati per attacchi XSS.

* URL: `https://dls03qes9fc77.cloudfront.net/api/docs/static/index.html`

**Soluzione:** Rimuovere 'unsafe-inline' da style-src dove possibile, usando nonce o hash per stili inline necessari.

---

### Header Content Security Policy (CSP) Non Impostato

##### Medio (Alto)

**Descrizione:** L'header CSP non è impostato sulle pagine frontend.

* URL interessati: `/`, `/cart`, `/sitemap.xml`

**Soluzione:** Configurare l'header CSP su tutte le risposte.

---

### Libreria JS Vulnerabile

##### Medio (Medio)

**Descrizione:** DOMPurify versione 3.1.4 ha CVE-2025-26791.

* URL: `https://dls03qes9fc77.cloudfront.net/api/docs/static/swagger-ui-bundle.js`

**Soluzione:** Aggiornare @fastify/swagger-ui per ottenere la versione patchata di DOMPurify.

---

### Header Strict-Transport-Security Non Impostato

##### Basso (Alto)

**Descrizione:** HSTS forza i browser a usare solo HTTPS. Non è impostato sulle pagine frontend.

**Soluzione:** Configurare HSTS con max-age appropriato.

---

### Server Espone Informazioni via "X-Powered-By"

##### Basso (Medio)

**Descrizione:** L'header `X-Powered-By: Next.js` espone il framework utilizzato.

**Soluzione:** Configurare Next.js con `poweredByHeader: false` in next.config.js.

---

### Header Permissions Policy Non Impostato

##### Basso (Medio)

**Descrizione:** Permissions Policy limita le funzionalità del browser (camera, microfono, ecc.).

**Soluzione:** Aggiungere header Permissions-Policy con restrizioni appropriate.

---

## Valutazione Rischio

```
┌─────────────────────────────────────────────────────────────┐
│                    MATRICE RISCHIO                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SEVERITÀ ALTA:      0 alert                                │
│  ════════════════════════════════════════════════════       │
│                                                              │
│  SEVERITÀ MEDIA:     4 alert (tutti relativi a CSP)         │
│  ████████████████                                           │
│  └── 3 su Swagger UI (dipendenza esterna)                   │
│  └── 1 su Frontend (opportunità di miglioramento)           │
│                                                              │
│  SEVERITÀ BASSA:     6 alert (opportunità hardening)        │
│  ████████████████████████                                   │
│                                                              │
│  INFORMATIVI:       11 alert (nessuna azione richiesta)     │
│  ████████████████████████████████████████████               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Raccomandazioni

### Priorità 1: Aggiornare Swagger UI
```bash
npm update @fastify/swagger-ui
```
Questo correggerà la CVE di DOMPurify.

### Priorità 2: Aggiungere CSP Frontend
```typescript
// next.config.js
async headers() {
  return [{
    source: '/:path*',
    headers: [{
      key: 'Content-Security-Policy',
      value: "default-src 'self'; ..."
    }]
  }]
}
```

### Priorità 3: Rimuovere X-Powered-By
```typescript
// next.config.js
poweredByHeader: false
```

### Priorità 4: Aggiungere Permissions Policy
```typescript
headers: [{
  key: 'Permissions-Policy',
  value: 'camera=(), microphone=(), geolocation=()'
}]
```

## Conclusione

La scansione baseline OWASP ZAP mostra una buona postura di sicurezza:

| Categoria | Valutazione |
|-----------|-------------|
| Vulnerabilità critiche | Nessuna |
| Problemi sfruttabili | Nessuno |
| Miglioramenti defense-in-depth | 4 medi, 6 bassi |
| Raccomandazioni best practice | 11 informativi |

Gli alert medi sono principalmente relativi a Swagger UI (dipendenza esterna) e rappresentano opportunità di hardening aggiuntivo piuttosto che vulnerabilità sfruttabili.

---

*Report generato da OWASP ZAP*
