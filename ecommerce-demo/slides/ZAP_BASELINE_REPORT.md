# ZAP Scanning Report

ZAP by [Checkmarx](https://checkmarx.com/).


## Summary of Alerts

| Risk Level | Number of Alerts |
| --- | --- |
| High | 0 |
| Medium | 4 |
| Low | 6 |
| Informational | 11 |




## Insights

| Level | Reason | Site | Description | Statistic |
| --- | --- | --- | --- | --- |
| Low | Warning |  | ZAP warnings logged - see the zap.log file for details | 3    |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of responses with status code 2xx | 95 % |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of responses with status code 3xx | 2 % |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of responses with status code 4xx | 2 % |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of responses with status code 5xx | 1 % |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of endpoints with content type application/javascript | 23 % |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of endpoints with content type application/json | 17 % |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of endpoints with content type font/woff2 | 1 % |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of endpoints with content type image/avif | 1 % |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of endpoints with content type image/png | 2 % |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of endpoints with content type text/css | 3 % |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of endpoints with content type text/html | 15 % |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of endpoints with content type text/x-component | 32 % |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of endpoints with method GET | 100 % |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Count of total endpoints | 88    |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of slow responses | 1 % |




## Alerts

| Name | Risk Level | Number of Instances |
| --- | --- | --- |
| CSP: Wildcard Directive | Medium | 1 |
| CSP: style-src unsafe-inline | Medium | 1 |
| Content Security Policy (CSP) Header Not Set | Medium | Systemic |
| Vulnerable JS Library | Medium | 1 |
| Insufficient Site Isolation Against Spectre Vulnerability | Low | 12 |
| Permissions Policy Header Not Set | Low | Systemic |
| Server Leaks Information via "X-Powered-By" HTTP Response Header Field(s) | Low | Systemic |
| Server Leaks Version Information via "Server" HTTP Response Header Field | Low | Systemic |
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




## Alert Detail



### [ CSP: Wildcard Directive ](https://www.zaproxy.org/docs/alerts/10055/)



##### Medium (High)

### Description

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks. Including (but not limited to) Cross Site Scripting (XSS), and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware. CSP provides a set of standard HTTP headers that allow website owners to declare approved sources of content that browsers should be allowed to load on that page — covered types are JavaScript, CSS, HTML frames, fonts, images and embeddable objects such as Java applets, ActiveX, audio and video files.

* URL: https://dls03qes9fc77.cloudfront.net/api/docs/static/index.html
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/docs/static/index.html`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self';script-src 'self';style-src 'self' 'unsafe-inline';img-src 'self' https: data:;connect-src 'self';font-src 'self';object-src 'none';frame-src 'none';base-uri 'self';form-action 'self';frame-ancestors 'none';script-src-attr 'none';upgrade-insecure-requests`
  * Other Info: `The following directives either allow wildcard sources (or ancestors), are not defined, or are overly broadly defined:
img-src`


Instances: 1

### Solution

Ensure that your web server, application server, load balancer, etc. is properly configured to set the Content-Security-Policy header.

### Reference


* [ https://www.w3.org/TR/CSP/ ](https://www.w3.org/TR/CSP/)
* [ https://caniuse.com/#search=content+security+policy ](https://caniuse.com/#search=content+security+policy)
* [ https://content-security-policy.com/ ](https://content-security-policy.com/)
* [ https://github.com/HtmlUnit/htmlunit-csp ](https://github.com/HtmlUnit/htmlunit-csp)
* [ https://web.dev/articles/csp#resource-options ](https://web.dev/articles/csp#resource-options)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ CSP: style-src unsafe-inline ](https://www.zaproxy.org/docs/alerts/10055/)



##### Medium (High)

### Description

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks. Including (but not limited to) Cross Site Scripting (XSS), and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware. CSP provides a set of standard HTTP headers that allow website owners to declare approved sources of content that browsers should be allowed to load on that page — covered types are JavaScript, CSS, HTML frames, fonts, images and embeddable objects such as Java applets, ActiveX, audio and video files.

* URL: https://dls03qes9fc77.cloudfront.net/api/docs/static/index.html
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/docs/static/index.html`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self';script-src 'self';style-src 'self' 'unsafe-inline';img-src 'self' https: data:;connect-src 'self';font-src 'self';object-src 'none';frame-src 'none';base-uri 'self';form-action 'self';frame-ancestors 'none';script-src-attr 'none';upgrade-insecure-requests`
  * Other Info: `style-src includes unsafe-inline.`


Instances: 1

### Solution

Ensure that your web server, application server, load balancer, etc. is properly configured to set the Content-Security-Policy header.

### Reference


* [ https://www.w3.org/TR/CSP/ ](https://www.w3.org/TR/CSP/)
* [ https://caniuse.com/#search=content+security+policy ](https://caniuse.com/#search=content+security+policy)
* [ https://content-security-policy.com/ ](https://content-security-policy.com/)
* [ https://github.com/HtmlUnit/htmlunit-csp ](https://github.com/HtmlUnit/htmlunit-csp)
* [ https://web.dev/articles/csp#resource-options ](https://web.dev/articles/csp#resource-options)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ Content Security Policy (CSP) Header Not Set ](https://www.zaproxy.org/docs/alerts/10038/)



##### Medium (High)

### Description

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks, including Cross Site Scripting (XSS) and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware. CSP provides a set of standard HTTP headers that allow website owners to declare approved sources of content that browsers should be allowed to load on that page — covered types are JavaScript, CSS, HTML frames, fonts, images and embeddable objects such as Java applets, ActiveX, audio and video files.

* URL: https://dls03qes9fc77.cloudfront.net
  * Node Name: `https://dls03qes9fc77.cloudfront.net`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/cart
  * Node Name: `https://dls03qes9fc77.cloudfront.net/cart`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/sitemap.xml
  * Node Name: `https://dls03qes9fc77.cloudfront.net/sitemap.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``

Instances: Systemic


### Solution

Ensure that your web server, application server, load balancer, etc. is configured to set the Content-Security-Policy header.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP)
* [ https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html ](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
* [ https://www.w3.org/TR/CSP/ ](https://www.w3.org/TR/CSP/)
* [ https://w3c.github.io/webappsec-csp/ ](https://w3c.github.io/webappsec-csp/)
* [ https://web.dev/articles/csp ](https://web.dev/articles/csp)
* [ https://caniuse.com/#feat=contentsecuritypolicy ](https://caniuse.com/#feat=contentsecuritypolicy)
* [ https://content-security-policy.com/ ](https://content-security-policy.com/)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ Vulnerable JS Library ](https://www.zaproxy.org/docs/alerts/10003/)



##### Medium (Medium)

### Description

The identified library appears to be vulnerable.

* URL: https://dls03qes9fc77.cloudfront.net/api/docs/static/swagger-ui-bundle.js
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/docs/static/swagger-ui-bundle.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `DOMPurify.version="3.1.4"`
  * Other Info: `The identified library DOMPurify, version 3.1.4 is vulnerable.
CVE-2025-26791
https://github.com/advisories/GHSA-vhxf-7vqr-mrjg
https://github.com/cure53/DOMPurify/releases/tag/3.2.4
https://github.com/cure53/DOMPurify
https://github.com/cure53/DOMPurify/commit/d18ffcb554e0001748865da03ac75dd7829f0f02
https://nvd.nist.gov/vuln/detail/CVE-2025-26791
https://ensy.zip/posts/dompurify-323-bypass
https://nsysean.github.io/posts/dompurify-323-bypass
`


Instances: 1

### Solution

Upgrade to the latest version of the affected library.

### Reference


* [ https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/ ](https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/)


#### CWE Id: [ 1395 ](https://cwe.mitre.org/data/definitions/1395.html)


#### Source ID: 3

### [ Insufficient Site Isolation Against Spectre Vulnerability ](https://www.zaproxy.org/docs/alerts/90004/)



##### Low (Medium)

### Description

Cross-Origin-Resource-Policy header is an opt-in header designed to counter side-channels attacks like Spectre. Resource should be specifically set as shareable amongst different origins.

* URL: https://dls03qes9fc77.cloudfront.net
  * Node Name: `https://dls03qes9fc77.cloudfront.net`
  * Method: `GET`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/`
  * Method: `GET`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/auth/login
  * Node Name: `https://dls03qes9fc77.cloudfront.net/auth/login`
  * Method: `GET`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/cart
  * Node Name: `https://dls03qes9fc77.cloudfront.net/cart`
  * Method: `GET`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net
  * Node Name: `https://dls03qes9fc77.cloudfront.net`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/auth/login
  * Node Name: `https://dls03qes9fc77.cloudfront.net/auth/login`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/cart
  * Node Name: `https://dls03qes9fc77.cloudfront.net/cart`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net
  * Node Name: `https://dls03qes9fc77.cloudfront.net`
  * Method: `GET`
  * Parameter: `Cross-Origin-Opener-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/`
  * Method: `GET`
  * Parameter: `Cross-Origin-Opener-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/auth/login
  * Node Name: `https://dls03qes9fc77.cloudfront.net/auth/login`
  * Method: `GET`
  * Parameter: `Cross-Origin-Opener-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/cart
  * Node Name: `https://dls03qes9fc77.cloudfront.net/cart`
  * Method: `GET`
  * Parameter: `Cross-Origin-Opener-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 12

### Solution

Ensure that the application/web server sets the Cross-Origin-Resource-Policy header appropriately, and that it sets the Cross-Origin-Resource-Policy header to 'same-origin' for all web pages.
'same-site' is considered as less secured and should be avoided.
If resources must be shared, set the header to 'cross-origin'.
If possible, ensure that the end user uses a standards-compliant and modern web browser that supports the Cross-Origin-Resource-Policy header (https://caniuse.com/mdn-http_headers_cross-origin-resource-policy).

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 14

#### Source ID: 3

### [ Permissions Policy Header Not Set ](https://www.zaproxy.org/docs/alerts/10063/)



##### Low (Medium)

### Description

Permissions Policy Header is an added layer of security that helps to restrict from unauthorized access or usage of browser/client features by web resources. This policy ensures the user privacy by limiting or specifying the features of the browsers can be used by the web resources. Permissions Policy provides a set of standard HTTP headers that allow website owners to limit which features of browsers can be used by the page such as camera, microphone, location, full screen etc.

* URL: https://dls03qes9fc77.cloudfront.net
  * Node Name: `https://dls03qes9fc77.cloudfront.net`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/cart
  * Node Name: `https://dls03qes9fc77.cloudfront.net/cart`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/robots.txt
  * Node Name: `https://dls03qes9fc77.cloudfront.net/robots.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/sitemap.xml
  * Node Name: `https://dls03qes9fc77.cloudfront.net/sitemap.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``

Instances: Systemic


### Solution

Ensure that your web server, application server, load balancer, etc. is configured to set the Permissions-Policy header.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy)
* [ https://developer.chrome.com/blog/feature-policy/ ](https://developer.chrome.com/blog/feature-policy/)
* [ https://scotthelme.co.uk/a-new-security-header-feature-policy/ ](https://scotthelme.co.uk/a-new-security-header-feature-policy/)
* [ https://w3c.github.io/webappsec-feature-policy/ ](https://w3c.github.io/webappsec-feature-policy/)
* [ https://www.smashingmagazine.com/2018/12/feature-policy/ ](https://www.smashingmagazine.com/2018/12/feature-policy/)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ Server Leaks Information via "X-Powered-By" HTTP Response Header Field(s) ](https://www.zaproxy.org/docs/alerts/10037/)



##### Low (Medium)

### Description

The web/application server is leaking information via one or more "X-Powered-By" HTTP response headers. Access to such information may facilitate attackers identifying other frameworks/components your web application is reliant upon and the vulnerabilities such components may be subject to.

* URL: https://dls03qes9fc77.cloudfront.net
  * Node Name: `https://dls03qes9fc77.cloudfront.net`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `X-Powered-By: Next.js`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `X-Powered-By: Next.js`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/cart
  * Node Name: `https://dls03qes9fc77.cloudfront.net/cart`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `X-Powered-By: Next.js`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/robots.txt
  * Node Name: `https://dls03qes9fc77.cloudfront.net/robots.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `X-Powered-By: Next.js`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/sitemap.xml
  * Node Name: `https://dls03qes9fc77.cloudfront.net/sitemap.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `X-Powered-By: Next.js`
  * Other Info: ``

Instances: Systemic


### Solution

Ensure that your web server, application server, load balancer, etc. is configured to suppress "X-Powered-By" headers.

### Reference


* [ https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/01-Information_Gathering/08-Fingerprint_Web_Application_Framework ](https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/01-Information_Gathering/08-Fingerprint_Web_Application_Framework)
* [ https://www.troyhunt.com/shhh-dont-let-your-response-headers/ ](https://www.troyhunt.com/shhh-dont-let-your-response-headers/)


#### CWE Id: [ 497 ](https://cwe.mitre.org/data/definitions/497.html)


#### WASC Id: 13

#### Source ID: 3

### [ Server Leaks Version Information via "Server" HTTP Response Header Field ](https://www.zaproxy.org/docs/alerts/10036/)



##### Low (High)

### Description

The web/application server is leaking version information via the "Server" HTTP response header. Access to such information may facilitate attackers identifying other vulnerabilities your web/application server is subject to.

* URL: https://dls03qes9fc77.cloudfront.net/_next/static/chunks/236f7e5abd6f09ff.js
  * Node Name: `https://dls03qes9fc77.cloudfront.net/_next/static/chunks/236f7e5abd6f09ff.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `awselb/2.0`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/_next/static/chunks/607913728679d029.js
  * Node Name: `https://dls03qes9fc77.cloudfront.net/_next/static/chunks/607913728679d029.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `awselb/2.0`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/_next/static/chunks/651e5de5ea95872e.js
  * Node Name: `https://dls03qes9fc77.cloudfront.net/_next/static/chunks/651e5de5ea95872e.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `awselb/2.0`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/_next/static/chunks/ff1a16fafef87110.js
  * Node Name: `https://dls03qes9fc77.cloudfront.net/_next/static/chunks/ff1a16fafef87110.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `awselb/2.0`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/_next/static/chunks/turbopack-7efcdd314ea523bb.js
  * Node Name: `https://dls03qes9fc77.cloudfront.net/_next/static/chunks/turbopack-7efcdd314ea523bb.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `awselb/2.0`
  * Other Info: ``

Instances: Systemic


### Solution

Ensure that your web server, application server, load balancer, etc. is configured to suppress the "Server" header or provide generic details.

### Reference


* [ https://httpd.apache.org/docs/current/mod/core.html#servertokens ](https://httpd.apache.org/docs/current/mod/core.html#servertokens)
* [ https://learn.microsoft.com/en-us/previous-versions/msp-n-p/ff648552(v=pandp.10) ](https://learn.microsoft.com/en-us/previous-versions/msp-n-p/ff648552(v=pandp.10))
* [ https://www.troyhunt.com/shhh-dont-let-your-response-headers/ ](https://www.troyhunt.com/shhh-dont-let-your-response-headers/)


#### CWE Id: [ 497 ](https://cwe.mitre.org/data/definitions/497.html)


#### WASC Id: 13

#### Source ID: 3

### [ Strict-Transport-Security Header Not Set ](https://www.zaproxy.org/docs/alerts/10035/)



##### Low (High)

### Description

HTTP Strict Transport Security (HSTS) is a web security policy mechanism whereby a web server declares that complying user agents (such as a web browser) are to interact with it using only secure HTTPS connections (i.e. HTTP layered over TLS/SSL). HSTS is an IETF standards track protocol and is specified in RFC 6797.

* URL: https://dls03qes9fc77.cloudfront.net
  * Node Name: `https://dls03qes9fc77.cloudfront.net`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/cart
  * Node Name: `https://dls03qes9fc77.cloudfront.net/cart`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/robots.txt
  * Node Name: `https://dls03qes9fc77.cloudfront.net/robots.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/sitemap.xml
  * Node Name: `https://dls03qes9fc77.cloudfront.net/sitemap.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``

Instances: Systemic


### Solution

Ensure that your web server, application server, load balancer, etc. is configured to enforce Strict-Transport-Security.

### Reference


* [ https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html ](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html)
* [ https://owasp.org/www-community/Security_Headers ](https://owasp.org/www-community/Security_Headers)
* [ https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security ](https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security)
* [ https://caniuse.com/stricttransportsecurity ](https://caniuse.com/stricttransportsecurity)
* [ https://datatracker.ietf.org/doc/html/rfc6797 ](https://datatracker.ietf.org/doc/html/rfc6797)


#### CWE Id: [ 319 ](https://cwe.mitre.org/data/definitions/319.html)


#### WASC Id: 15

#### Source ID: 3

### [ Timestamp Disclosure - Unix ](https://www.zaproxy.org/docs/alerts/10096/)



##### Low (Low)

### Description

A timestamp was disclosed by the application/web server. - Unix

* URL: https://dls03qes9fc77.cloudfront.net/api/docs/static/swagger-ui-standalone-preset.js
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/docs/static/swagger-ui-standalone-preset.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `1518500249`
  * Other Info: `1518500249, which evaluates to: 2018-02-13 05:37:29.`
* URL: https://dls03qes9fc77.cloudfront.net/api/docs/static/swagger-ui-standalone-preset.js
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/docs/static/swagger-ui-standalone-preset.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `1732584193`
  * Other Info: `1732584193, which evaluates to: 2024-11-26 01:23:13.`
* URL: https://dls03qes9fc77.cloudfront.net/api/docs/static/swagger-ui-standalone-preset.js
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/docs/static/swagger-ui-standalone-preset.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `1750603025`
  * Other Info: `1750603025, which evaluates to: 2025-06-22 14:37:05.`
* URL: https://dls03qes9fc77.cloudfront.net/api/docs/static/swagger-ui-standalone-preset.js
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/docs/static/swagger-ui-standalone-preset.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `1859775393`
  * Other Info: `1859775393, which evaluates to: 2028-12-07 04:16:33.`
* URL: https://dls03qes9fc77.cloudfront.net/api/docs/static/swagger-ui-standalone-preset.js
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/docs/static/swagger-ui-standalone-preset.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `1894007588`
  * Other Info: `1894007588, which evaluates to: 2030-01-07 09:13:08.`

Instances: Systemic


### Solution

Manually confirm that the timestamp data is not sensitive, and that the data cannot be aggregated to disclose exploitable patterns.

### Reference


* [ https://cwe.mitre.org/data/definitions/200.html ](https://cwe.mitre.org/data/definitions/200.html)


#### CWE Id: [ 497 ](https://cwe.mitre.org/data/definitions/497.html)


#### WASC Id: 13

#### Source ID: 3

### [ Base64 Disclosure ](https://www.zaproxy.org/docs/alerts/10094/)



##### Informational (Medium)

### Description

Base64 encoded data was disclosed by the application/web server. Note: in the interests of performance not all base64 strings in the response were analyzed individually, the entire response should be looked at by the analyst/security team/developer(s).

* URL: https://dls03qes9fc77.cloudfront.net
  * Node Name: `https://dls03qes9fc77.cloudfront.net`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `LvcJTPEdGlzb2T7eF4lcOJztYn8mK76LEoaffWLaPryKw9SvFiOYgA==`
  * Other Info: `.�	L�\��>��\8��b&+����}b�>���ԯ#��`
* URL: https://dls03qes9fc77.cloudfront.net/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `qidXejB74iUWOBFVyill8VVRevR7Oi7Qk2uOxdum6pE4ufaJr9DRLw==`
  * Other Info: `�'Wz0{�%8U�)e�UQz�{:.Гk��ۦ�8������/`
* URL: https://dls03qes9fc77.cloudfront.net/api/docs
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/docs`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `hGdWGmCwjp57n-1lRvEEjAhSG3IngyHY1Y6ERiMJLdGpjqtyXPX8Dg==`
  * Other Info: `�gV`���{��eF��Rr'�!�Վ�F#	-ѩ��r\��`
* URL: https://dls03qes9fc77.cloudfront.net/auth/login
  * Node Name: `https://dls03qes9fc77.cloudfront.net/auth/login`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `SMmlwoNrncEyvgY-Y1tTNjDwSp1UghkpSLio7Pwd48yPDQiDxIBuMA==`
  * Other Info: `Hɥk��2�>c[S60�J�T�)H�����̏�Ān0`
* URL: https://dls03qes9fc77.cloudfront.net/cart
  * Node Name: `https://dls03qes9fc77.cloudfront.net/cart`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `zb1b5IM0LlD--5tNq2hdZFlnQ_WvF2AS44TW4BEe1e8PXxy6BJ0jTA==`
  * Other Info: `ͽ[�4.P���M�h]dYgC��`�����_��#L`
* URL: https://dls03qes9fc77.cloudfront.net/categories
  * Node Name: `https://dls03qes9fc77.cloudfront.net/categories`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `J5J6dcjoKnsnLIbLdMSCBKrweQsx1BVZmq0XKhGDuue2sL-1OkO4Lg==`
  * Other Info: `'�zu��*{',��tĂ��y1�Y��*��綰��:C�.`
* URL: https://dls03qes9fc77.cloudfront.net/privacy
  * Node Name: `https://dls03qes9fc77.cloudfront.net/privacy`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `ZftMS7Pka0vNVTt7EPulAAgP_7OuJdmWTle2_TeUMw65Xks00X9w5Q==`
  * Other Info: `e�LK��kK�U;{�� ���%ٖNW��7�3�^K4�p�`
* URL: https://dls03qes9fc77.cloudfront.net/products
  * Node Name: `https://dls03qes9fc77.cloudfront.net/products`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `XbHWFqqQgqE3Y3TgUhyASlM-RA8-s0j8R5qstvdho-354_E3KqCpZg==`
  * Other Info: `]������7ct�R�JS>D>�H�G����a�����7*��f`
* URL: https://dls03qes9fc77.cloudfront.net/products%3Ffeatured=true
  * Node Name: `https://dls03qes9fc77.cloudfront.net/products (featured)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `h6FPefsvvvAjZuTQIWwPUX6QdJqj9974ayPWnx0HeSRa2ScZyt9G_A==`
  * Other Info: `��Oy�/��#f��!lQ~�t�����k#֟y$Z�'��F�`
* URL: https://dls03qes9fc77.cloudfront.net/products%3Fsale=true
  * Node Name: `https://dls03qes9fc77.cloudfront.net/products (sale)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `buLNB5-1NnLP4yGooZ1ecyyVXit2Pxg7S6YLy1L_T6hs5XCrUJrJwg==`
  * Other Info: `n����6r��!���^s,�^+v?;K��R�O�l�p�P���`
* URL: https://dls03qes9fc77.cloudfront.net/robots.txt
  * Node Name: `https://dls03qes9fc77.cloudfront.net/robots.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `uBB3GB5udlIWZdw-HjJ_-pvleP1cL9v46Gtn99gfnzmuEvRzB4X5Rg==`
  * Other Info: `�wnvRe�>2���x�\/���kg���9��s��F`
* URL: https://dls03qes9fc77.cloudfront.net/sitemap.xml
  * Node Name: `https://dls03qes9fc77.cloudfront.net/sitemap.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `WYFHxpHlExG1pbRlV4UIe6tFquiLHbT-kHBZmJxEVMxJLah0-RJpwQ==`
  * Other Info: `Y�GƑ����eW�{�E�����pY��DT�I-�t�i�`


Instances: 12

### Solution

Manually confirm that the Base64 data does not leak sensitive information, and that the data cannot be aggregated/used to exploit other vulnerabilities.

### Reference


* [ https://projects.webappsec.org/w/page/13246936/Information%20Leakage ](https://projects.webappsec.org/w/page/13246936/Information%20Leakage)


#### CWE Id: [ 319 ](https://cwe.mitre.org/data/definitions/319.html)


#### WASC Id: 13

#### Source ID: 3

### [ Content-Type Header Missing ](https://www.zaproxy.org/docs/alerts/10019/)



##### Informational (Medium)

### Description

The Content-Type header was either missing or empty.

* URL: https://dls03qes9fc77.cloudfront.net/_next/image%3Furl=https%253A%252F%252Fimages.unsplash.com%252Fphoto-1461896836934-%2520voices-of-passion%253Fw%253D400&w=640&q=75
  * Node Name: `https://dls03qes9fc77.cloudfront.net/_next/image (q,url,w)`
  * Method: `GET`
  * Parameter: `content-type`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 1

### Solution

Ensure each page is setting the specific and appropriate content-type value for the content being delivered.

### Reference


* [ https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/compatibility/gg622941(v=vs.85) ](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/compatibility/gg622941(v=vs.85))


#### CWE Id: [ 345 ](https://cwe.mitre.org/data/definitions/345.html)


#### WASC Id: 12

#### Source ID: 3

### [ Information Disclosure - Suspicious Comments ](https://www.zaproxy.org/docs/alerts/10027/)



##### Informational (Low)

### Description

The response appears to contain suspicious comments which may help an attacker.

* URL: https://dls03qes9fc77.cloudfront.net
  * Node Name: `https://dls03qes9fc77.cloudfront.net`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `User`
  * Other Info: `The following pattern was used: \bUSER\b and was detected in likely comment: "//www.w3.org/2000/svg\",\"width\":24,\"height\":24,\"viewBox\":\"0 0 24 24\",\"fill\":\"none\",\"stroke\":\"currentColor\",\"str", see evidence field for the suspicious comment/snippet.`
* URL: https://dls03qes9fc77.cloudfront.net/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `User`
  * Other Info: `The following pattern was used: \bUSER\b and was detected in likely comment: "//www.w3.org/2000/svg\",\"width\":24,\"height\":24,\"viewBox\":\"0 0 24 24\",\"fill\":\"none\",\"stroke\":\"currentColor\",\"str", see evidence field for the suspicious comment/snippet.`
* URL: https://dls03qes9fc77.cloudfront.net/_next/static/chunks/17bb38bff44521fb.js
  * Node Name: `https://dls03qes9fc77.cloudfront.net/_next/static/chunks/17bb38bff44521fb.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `bug`
  * Other Info: `The following pattern was used: \bBUG\b and was detected in likely comment: "//react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var r=2;r<arguments.length;r++)", see evidence field for the suspicious comment/snippet.`
* URL: https://dls03qes9fc77.cloudfront.net/_next/static/chunks/236f7e5abd6f09ff.js
  * Node Name: `https://dls03qes9fc77.cloudfront.net/_next/static/chunks/236f7e5abd6f09ff.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `bug`
  * Other Info: `The following pattern was used: \bBUG\b and was detected in likely comment: "//nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams")}}class a extends URLSearchParams{append(", see evidence field for the suspicious comment/snippet.`
* URL: https://dls03qes9fc77.cloudfront.net/_next/static/chunks/30ea11065999f7ac.js
  * Node Name: `https://dls03qes9fc77.cloudfront.net/_next/static/chunks/30ea11065999f7ac.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `select`
  * Other Info: `The following pattern was used: \bSELECT\b and was detected in likely comment: "//react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)", see evidence field for the suspicious comment/snippet.`
* URL: https://dls03qes9fc77.cloudfront.net/_next/static/chunks/607913728679d029.js
  * Node Name: `https://dls03qes9fc77.cloudfront.net/_next/static/chunks/607913728679d029.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `user`
  * Other Info: `The following pattern was used: \bUSER\b and was detected in likely comment: "//localhost";e.s(["hasBrowserEnv",()=>ed,"hasStandardBrowserEnv",()=>eg,"hasStandardBrowserWebWorkerEnv",()=>em,"navigator",()=>", see evidence field for the suspicious comment/snippet.`
* URL: https://dls03qes9fc77.cloudfront.net/_next/static/chunks/651e5de5ea95872e.js
  * Node Name: `https://dls03qes9fc77.cloudfront.net/_next/static/chunks/651e5de5ea95872e.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Query`
  * Other Info: `The following pattern was used: \bQUERY\b and was detected in likely comment: "//${e.P("node_modules/zustand/esm/vanilla.mjs")}`}},r=e=>{let r,s=new Set,a=(e,t)=>{let a="function"==typeof e?e(r):e;if(!Object", see evidence field for the suspicious comment/snippet.`
* URL: https://dls03qes9fc77.cloudfront.net/_next/static/chunks/78632e0f269ff4e6.js
  * Node Name: `https://dls03qes9fc77.cloudfront.net/_next/static/chunks/78632e0f269ff4e6.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `query`
  * Other Info: `The following pattern was used: \bQUERY\b and was detected in likely comment: "//"+(l||""),n&&"/"!==n[0]&&(n="/"+n)):l||(l=""),a&&"#"!==a[0]&&(a="#"+a),c&&"?"!==c[0]&&(c="?"+c),n=n.replace(/[?#]/g,encodeURIC", see evidence field for the suspicious comment/snippet.`
* URL: https://dls03qes9fc77.cloudfront.net/_next/static/chunks/a14814ccd28e808f.js
  * Node Name: `https://dls03qes9fc77.cloudfront.net/_next/static/chunks/a14814ccd28e808f.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `query`
  * Other Info: `The following pattern was used: \bQUERY\b and was detected in likely comment: "//nextjs.org/docs/messages/next-image-missing-loader`),"__NEXT_ERROR_CODE",{value:"E252",enumerable:!1,configurable:!0})}else{le", see evidence field for the suspicious comment/snippet.`
* URL: https://dls03qes9fc77.cloudfront.net/_next/static/chunks/a6dad97d9634a72d.js
  * Node Name: `https://dls03qes9fc77.cloudfront.net/_next/static/chunks/a6dad97d9634a72d.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `from`
  * Other Info: `The following pattern was used: \bFROM\b and was detected in likely comment: "//github.com/zloirock/core-js/blob/v3.38.1/LICENSE",source:"https://github.com/zloirock/core-js"})}),nt=function(t,e){return rt[", see evidence field for the suspicious comment/snippet.`
* URL: https://dls03qes9fc77.cloudfront.net/_next/static/chunks/c175b9379b465c7c.js
  * Node Name: `https://dls03qes9fc77.cloudfront.net/_next/static/chunks/c175b9379b465c7c.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `query`
  * Other Info: `The following pattern was used: \bQUERY\b and was detected in likely comment: "//nextjs.org/docs/messages/next-image-missing-loader`),"__NEXT_ERROR_CODE",{value:"E252",enumerable:!1,configurable:!0})}else{le", see evidence field for the suspicious comment/snippet.`
* URL: https://dls03qes9fc77.cloudfront.net/_next/static/chunks/e9ccd1f1085788b7.js
  * Node Name: `https://dls03qes9fc77.cloudfront.net/_next/static/chunks/e9ccd1f1085788b7.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `query`
  * Other Info: `The following pattern was used: \bQUERY\b and was detected in likely comment: "//nextjs.org/docs/messages/next-image-missing-loader`),"__NEXT_ERROR_CODE",{value:"E252",enumerable:!1,configurable:!0})}else{le", see evidence field for the suspicious comment/snippet.`


Instances: 12

### Solution

Remove all comments that return information that may help an attacker and fix any underlying problems they refer to.

### Reference



#### CWE Id: [ 615 ](https://cwe.mitre.org/data/definitions/615.html)


#### WASC Id: 13

#### Source ID: 3

### [ Modern Web Application ](https://www.zaproxy.org/docs/alerts/10109/)



##### Informational (Medium)

### Description

The application appears to be a modern web application. If you need to explore it automatically then the Ajax Spider may well be more effective than the standard one.

* URL: https://dls03qes9fc77.cloudfront.net
  * Node Name: `https://dls03qes9fc77.cloudfront.net`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<a href="#" class="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Twitter"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-twitter w-5 h-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg></a>`
  * Other Info: `Links have been found that do not have traditional href attributes, which is an indication that this is a modern web application.`
* URL: https://dls03qes9fc77.cloudfront.net/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<a href="#" class="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Twitter"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-twitter w-5 h-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg></a>`
  * Other Info: `Links have been found that do not have traditional href attributes, which is an indication that this is a modern web application.`
* URL: https://dls03qes9fc77.cloudfront.net/cart
  * Node Name: `https://dls03qes9fc77.cloudfront.net/cart`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<a href="#" class="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Twitter"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-twitter w-5 h-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg></a>`
  * Other Info: `Links have been found that do not have traditional href attributes, which is an indication that this is a modern web application.`
* URL: https://dls03qes9fc77.cloudfront.net/robots.txt
  * Node Name: `https://dls03qes9fc77.cloudfront.net/robots.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<a href="#" class="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Twitter"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-twitter w-5 h-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg></a>`
  * Other Info: `Links have been found that do not have traditional href attributes, which is an indication that this is a modern web application.`
* URL: https://dls03qes9fc77.cloudfront.net/sitemap.xml
  * Node Name: `https://dls03qes9fc77.cloudfront.net/sitemap.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<a href="#" class="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Twitter"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-twitter w-5 h-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg></a>`
  * Other Info: `Links have been found that do not have traditional href attributes, which is an indication that this is a modern web application.`

Instances: Systemic


### Solution

This is an informational alert and so no changes are required.

### Reference




#### Source ID: 3

### [ Non-Storable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are not storable by caching components such as proxy servers. If the response does not contain sensitive, personal or user-specific information, it may benefit from being stored and cached, to improve performance.

* URL: https://dls03qes9fc77.cloudfront.net/robots.txt
  * Node Name: `https://dls03qes9fc77.cloudfront.net/robots.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `no-store`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/sitemap.xml
  * Node Name: `https://dls03qes9fc77.cloudfront.net/sitemap.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `no-store`
  * Other Info: ``


Instances: 2

### Solution

The content may be marked as storable by ensuring that the following conditions are satisfied:
The request method must be understood by the cache and defined as being cacheable ("GET", "HEAD", and "POST" are currently defined as cacheable)
The response status code must be understood by the cache (one of the 1XX, 2XX, 3XX, 4XX, or 5XX response classes are generally understood)
The "no-store" cache directive must not appear in the request or response header fields
For caching by "shared" caches such as "proxy" caches, the "private" response directive must not appear in the response
For caching by "shared" caches such as "proxy" caches, the "Authorization" header field must not appear in the request, unless the response explicitly allows it (using one of the "must-revalidate", "public", or "s-maxage" Cache-Control response directives)
In addition to the conditions above, at least one of the following conditions must also be satisfied by the response:
It must contain an "Expires" header field
It must contain a "max-age" response directive
For "shared" caches such as "proxy" caches, it must contain a "s-maxage" response directive
It must contain a "Cache Control Extension" that allows it to be cached
It must have a status code that is defined as cacheable by default (200, 203, 204, 206, 300, 301, 404, 405, 410, 414, 501).

### Reference


* [ https://datatracker.ietf.org/doc/html/rfc7234 ](https://datatracker.ietf.org/doc/html/rfc7234)
* [ https://datatracker.ietf.org/doc/html/rfc7231 ](https://datatracker.ietf.org/doc/html/rfc7231)
* [ https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html ](https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html)


#### CWE Id: [ 524 ](https://cwe.mitre.org/data/definitions/524.html)


#### WASC Id: 13

#### Source ID: 3

### [ Re-examine Cache-control Directives ](https://www.zaproxy.org/docs/alerts/10015/)



##### Informational (Low)

### Description

The cache-control header has not been set properly or is missing, allowing the browser and proxies to cache content. For static assets like css, js, or image files this might be intended, however, the resources should be reviewed to ensure that no sensitive content will be cached.

* URL: https://dls03qes9fc77.cloudfront.net
  * Node Name: `https://dls03qes9fc77.cloudfront.net`
  * Method: `GET`
  * Parameter: `cache-control`
  * Attack: ``
  * Evidence: `s-maxage=31536000`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/`
  * Method: `GET`
  * Parameter: `cache-control`
  * Attack: ``
  * Evidence: `s-maxage=31536000`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/auth/login
  * Node Name: `https://dls03qes9fc77.cloudfront.net/auth/login`
  * Method: `GET`
  * Parameter: `cache-control`
  * Attack: ``
  * Evidence: `s-maxage=31536000`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/cart
  * Node Name: `https://dls03qes9fc77.cloudfront.net/cart`
  * Method: `GET`
  * Parameter: `cache-control`
  * Attack: ``
  * Evidence: `s-maxage=31536000`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/products
  * Node Name: `https://dls03qes9fc77.cloudfront.net/products`
  * Method: `GET`
  * Parameter: `cache-control`
  * Attack: ``
  * Evidence: `s-maxage=31536000`
  * Other Info: ``

Instances: Systemic


### Solution

For secure content, ensure the cache-control HTTP header is set with "no-cache, no-store, must-revalidate". If an asset should be cached consider setting the directives "public, max-age, immutable".

### Reference


* [ https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#web-content-caching ](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#web-content-caching)
* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control)
* [ https://grayduck.mn/2021/09/13/cache-control-recommendations/ ](https://grayduck.mn/2021/09/13/cache-control-recommendations/)


#### CWE Id: [ 525 ](https://cwe.mitre.org/data/definitions/525.html)


#### WASC Id: 13

#### Source ID: 3

### [ Sec-Fetch-Dest Header is Missing ](https://www.zaproxy.org/docs/alerts/90005/)



##### Informational (High)

### Description

Specifies how and where the data would be used. For instance, if the value is audio, then the requested resource must be audio data and not any other type of resource.

* URL: https://dls03qes9fc77.cloudfront.net
  * Node Name: `https://dls03qes9fc77.cloudfront.net`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Dest`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/robots.txt
  * Node Name: `https://dls03qes9fc77.cloudfront.net/robots.txt`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Dest`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/sitemap.xml
  * Node Name: `https://dls03qes9fc77.cloudfront.net/sitemap.xml`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Dest`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 3

### Solution

Ensure that Sec-Fetch-Dest header is included in request headers.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Dest ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Dest)


#### CWE Id: [ 352 ](https://cwe.mitre.org/data/definitions/352.html)


#### WASC Id: 9

#### Source ID: 3

### [ Sec-Fetch-Mode Header is Missing ](https://www.zaproxy.org/docs/alerts/90005/)



##### Informational (High)

### Description

Allows to differentiate between requests for navigating between HTML pages and requests for loading resources like images, audio etc.

* URL: https://dls03qes9fc77.cloudfront.net
  * Node Name: `https://dls03qes9fc77.cloudfront.net`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Mode`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/robots.txt
  * Node Name: `https://dls03qes9fc77.cloudfront.net/robots.txt`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Mode`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/sitemap.xml
  * Node Name: `https://dls03qes9fc77.cloudfront.net/sitemap.xml`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Mode`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 3

### Solution

Ensure that Sec-Fetch-Mode header is included in request headers.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Mode ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Mode)


#### CWE Id: [ 352 ](https://cwe.mitre.org/data/definitions/352.html)


#### WASC Id: 9

#### Source ID: 3

### [ Sec-Fetch-Site Header is Missing ](https://www.zaproxy.org/docs/alerts/90005/)



##### Informational (High)

### Description

Specifies the relationship between request initiator's origin and target's origin.

* URL: https://dls03qes9fc77.cloudfront.net
  * Node Name: `https://dls03qes9fc77.cloudfront.net`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Site`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/robots.txt
  * Node Name: `https://dls03qes9fc77.cloudfront.net/robots.txt`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Site`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/sitemap.xml
  * Node Name: `https://dls03qes9fc77.cloudfront.net/sitemap.xml`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Site`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 3

### Solution

Ensure that Sec-Fetch-Site header is included in request headers.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Site ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Site)


#### CWE Id: [ 352 ](https://cwe.mitre.org/data/definitions/352.html)


#### WASC Id: 9

#### Source ID: 3

### [ Sec-Fetch-User Header is Missing ](https://www.zaproxy.org/docs/alerts/90005/)



##### Informational (High)

### Description

Specifies if a navigation request was initiated by a user.

* URL: https://dls03qes9fc77.cloudfront.net
  * Node Name: `https://dls03qes9fc77.cloudfront.net`
  * Method: `GET`
  * Parameter: `Sec-Fetch-User`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/robots.txt
  * Node Name: `https://dls03qes9fc77.cloudfront.net/robots.txt`
  * Method: `GET`
  * Parameter: `Sec-Fetch-User`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/sitemap.xml
  * Node Name: `https://dls03qes9fc77.cloudfront.net/sitemap.xml`
  * Method: `GET`
  * Parameter: `Sec-Fetch-User`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 3

### Solution

Ensure that Sec-Fetch-User header is included in user initiated requests.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-User ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-User)


#### CWE Id: [ 352 ](https://cwe.mitre.org/data/definitions/352.html)


#### WASC Id: 9

#### Source ID: 3

### [ Storable and Cacheable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are storable by caching components such as proxy servers, and may be retrieved directly from the cache, rather than from the origin server by the caching servers, in response to similar requests from other users. If the response data is sensitive, personal or user-specific, this may result in sensitive information being leaked. In some cases, this may even result in a user gaining complete control of the session of another user, depending on the configuration of the caching components in use in their environment. This is primarily an issue where "shared" caching servers such as "proxy" caches are configured on the local network. This configuration is typically found in corporate or educational environments, for instance.

* URL: https://dls03qes9fc77.cloudfront.net
  * Node Name: `https://dls03qes9fc77.cloudfront.net`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `s-maxage=31536000`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `s-maxage=31536000`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/docs
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/docs`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: https://dls03qes9fc77.cloudfront.net/auth/login
  * Node Name: `https://dls03qes9fc77.cloudfront.net/auth/login`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `s-maxage=31536000`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/cart
  * Node Name: `https://dls03qes9fc77.cloudfront.net/cart`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `s-maxage=31536000`
  * Other Info: ``

Instances: Systemic


### Solution

Validate that the response does not contain sensitive, personal or user-specific information. If it does, consider the use of the following HTTP response headers, to limit, or prevent the content being stored and retrieved from the cache by another user:
Cache-Control: no-cache, no-store, must-revalidate, private
Pragma: no-cache
Expires: 0
This configuration directs both HTTP 1.0 and HTTP 1.1 compliant caching servers to not store the response, and to not retrieve the response (without validation) from the cache, in response to a similar request.

### Reference


* [ https://datatracker.ietf.org/doc/html/rfc7234 ](https://datatracker.ietf.org/doc/html/rfc7234)
* [ https://datatracker.ietf.org/doc/html/rfc7231 ](https://datatracker.ietf.org/doc/html/rfc7231)
* [ https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html ](https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html)


#### CWE Id: [ 524 ](https://cwe.mitre.org/data/definitions/524.html)


#### WASC Id: 13

#### Source ID: 3


