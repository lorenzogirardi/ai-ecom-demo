# ZAP Scanning Report

ZAP by [Checkmarx](https://checkmarx.com/).


## Summary of Alerts

| Risk Level | Number of Alerts |
| --- | --- |
| High | 0 |
| Medium | 1 |
| Low | 5 |
| Informational | 5 |




## Insights

| Level | Reason | Site | Description | Statistic |
| --- | --- | --- | --- | --- |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of responses with status code 2xx | 9 % |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of responses with status code 3xx | 6 % |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of responses with status code 4xx | 83 % |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of endpoints with content type application/json | 80 % |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of endpoints with content type text/html | 19 % |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of endpoints with method DELETE | 4 % |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of endpoints with method GET | 69 % |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of endpoints with method PATCH | 8 % |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of endpoints with method POST | 16 % |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Count of total endpoints | 89    |
| Info | Informational | https://dls03qes9fc77.cloudfront.net | Percentage of slow responses | 34 % |




## Alerts

| Name | Risk Level | Number of Instances |
| --- | --- | --- |
| Content Security Policy (CSP) Header Not Set | Medium | 3 |
| Permissions Policy Header Not Set | Low | 3 |
| Server Leaks Information via "X-Powered-By" HTTP Response Header Field(s) | Low | 3 |
| Strict-Transport-Security Header Not Set | Low | 3 |
| Timestamp Disclosure - Unix | Low | 5 |
| Unexpected Content-Type was returned | Low | 18 |
| A Client Error response code was returned by the server | Informational | 82 |
| Modern Web Application | Informational | 3 |
| Non-Storable Content | Informational | Systemic |
| Re-examine Cache-control Directives | Informational | 4 |
| Storable and Cacheable Content | Informational | 2 |




## Alert Detail



### [ Content Security Policy (CSP) Header Not Set ](https://www.zaproxy.org/docs/alerts/10038/)



##### Medium (High)

### Description

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks, including Cross Site Scripting (XSS) and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware. CSP provides a set of standard HTTP headers that allow website owners to declare approved sources of content that browsers should be allowed to load on that page — covered types are JavaScript, CSS, HTML frames, fonts, images and embeddable objects such as Java applets, ActiveX, audio and video files.

* URL: https://dls03qes9fc77.cloudfront.net/health
  * Node Name: `https://dls03qes9fc77.cloudfront.net/health`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/metrics/cache
  * Node Name: `https://dls03qes9fc77.cloudfront.net/metrics/cache`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/ready
  * Node Name: `https://dls03qes9fc77.cloudfront.net/ready`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 3

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

### [ Permissions Policy Header Not Set ](https://www.zaproxy.org/docs/alerts/10063/)



##### Low (Medium)

### Description

Permissions Policy Header is an added layer of security that helps to restrict from unauthorized access or usage of browser/client features by web resources. This policy ensures the user privacy by limiting or specifying the features of the browsers can be used by the web resources. Permissions Policy provides a set of standard HTTP headers that allow website owners to limit which features of browsers can be used by the page such as camera, microphone, location, full screen etc.

* URL: https://dls03qes9fc77.cloudfront.net/health
  * Node Name: `https://dls03qes9fc77.cloudfront.net/health`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/metrics/cache
  * Node Name: `https://dls03qes9fc77.cloudfront.net/metrics/cache`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/ready
  * Node Name: `https://dls03qes9fc77.cloudfront.net/ready`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 3

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

* URL: https://dls03qes9fc77.cloudfront.net/health
  * Node Name: `https://dls03qes9fc77.cloudfront.net/health`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `X-Powered-By: Next.js`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/metrics/cache
  * Node Name: `https://dls03qes9fc77.cloudfront.net/metrics/cache`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `X-Powered-By: Next.js`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/ready
  * Node Name: `https://dls03qes9fc77.cloudfront.net/ready`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `X-Powered-By: Next.js`
  * Other Info: ``


Instances: 3

### Solution

Ensure that your web server, application server, load balancer, etc. is configured to suppress "X-Powered-By" headers.

### Reference


* [ https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/01-Information_Gathering/08-Fingerprint_Web_Application_Framework ](https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/01-Information_Gathering/08-Fingerprint_Web_Application_Framework)
* [ https://www.troyhunt.com/shhh-dont-let-your-response-headers/ ](https://www.troyhunt.com/shhh-dont-let-your-response-headers/)


#### CWE Id: [ 497 ](https://cwe.mitre.org/data/definitions/497.html)


#### WASC Id: 13

#### Source ID: 3

### [ Strict-Transport-Security Header Not Set ](https://www.zaproxy.org/docs/alerts/10035/)



##### Low (High)

### Description

HTTP Strict Transport Security (HSTS) is a web security policy mechanism whereby a web server declares that complying user agents (such as a web browser) are to interact with it using only secure HTTPS connections (i.e. HTTP layered over TLS/SSL). HSTS is an IETF standards track protocol and is specified in RFC 6797.

* URL: https://dls03qes9fc77.cloudfront.net/health
  * Node Name: `https://dls03qes9fc77.cloudfront.net/health`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/metrics/cache
  * Node Name: `https://dls03qes9fc77.cloudfront.net/metrics/cache`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/ready
  * Node Name: `https://dls03qes9fc77.cloudfront.net/ready`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 3

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

* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/products
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/products`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `1542272604`
  * Other Info: `1542272604, which evaluates to: 2018-11-15 09:03:24.`
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/products
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/products`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `1542291026`
  * Other Info: `1542291026, which evaluates to: 2018-11-15 14:10:26.`
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/products
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/products`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `1544716278`
  * Other Info: `1544716278, which evaluates to: 2018-12-13 15:51:18.`
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/products
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/products`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `1551028719`
  * Other Info: `1551028719, which evaluates to: 2019-02-24 17:18:39.`
* URL: https://dls03qes9fc77.cloudfront.net/api/search/popular
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/search/popular`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `1542272604`
  * Other Info: `1542272604, which evaluates to: 2018-11-15 09:03:24.`


Instances: 5

### Solution

Manually confirm that the timestamp data is not sensitive, and that the data cannot be aggregated to disclose exploitable patterns.

### Reference


* [ https://cwe.mitre.org/data/definitions/200.html ](https://cwe.mitre.org/data/definitions/200.html)


#### CWE Id: [ 497 ](https://cwe.mitre.org/data/definitions/497.html)


#### WASC Id: 13

#### Source ID: 3

### [ Unexpected Content-Type was returned ](https://www.zaproxy.org/docs/alerts/100001/)



##### Low (High)

### Description

A Content-Type of text/html was returned by the server.
This is not one of the types expected to be returned by an API.
Raised by the 'Alert on Unexpected Content Types' script

* URL: https://dls03qes9fc77.cloudfront.net
  * Node Name: `https://dls03qes9fc77.cloudfront.net`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/4698689398718167090
  * Node Name: `https://dls03qes9fc77.cloudfront.net/4698689398718167090`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/docs/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/docs/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/docs/static/index.html
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/docs/static/index.html`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/computeMetadata/v1/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/computeMetadata/v1/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/health
  * Node Name: `https://dls03qes9fc77.cloudfront.net/health`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/health/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/health/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/latest/meta-data/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/latest/meta-data/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/metadata/instance
  * Node Name: `https://dls03qes9fc77.cloudfront.net/metadata/instance`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/metrics
  * Node Name: `https://dls03qes9fc77.cloudfront.net/metrics`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/metrics/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/metrics/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/metrics/4835326925883131267
  * Node Name: `https://dls03qes9fc77.cloudfront.net/metrics/4835326925883131267`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/metrics/cache
  * Node Name: `https://dls03qes9fc77.cloudfront.net/metrics/cache`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/metrics/cache/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/metrics/cache/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/opc/v1/instance/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/opc/v1/instance/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/ready
  * Node Name: `https://dls03qes9fc77.cloudfront.net/ready`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/ready/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/ready/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``


Instances: 18

### Solution



### Reference




#### Source ID: 4

### [ A Client Error response code was returned by the server ](https://www.zaproxy.org/docs/alerts/100000/)



##### Informational (High)

### Description

A response code of 404 was returned by the server.
This may indicate that the application is failing to handle unexpected input correctly.
Raised by the 'Alert on HTTP Response Code Error' script

* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/categories/id
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/categories/id`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/categories/id/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/categories/id/`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/products/id
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/products/id`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/products/id/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/products/id/`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/4698689398718167090
  * Node Name: `https://dls03qes9fc77.cloudfront.net/4698689398718167090`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/3723237208397728523
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/3723237208397728523`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/auth
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/auth`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/auth/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/auth/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/auth/1228821100495706953
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/auth/1228821100495706953`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/auth/me
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/auth/me`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/auth/me/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/auth/me/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/8808101987410777781
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/8808101987410777781`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/categories/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/categories/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/categories/4719963956595480336
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/categories/4719963956595480336`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/categories/idOrSlug
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/categories/idOrSlug`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/categories/idOrSlug/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/categories/idOrSlug/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/products/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/products/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/products/8494058465729906530
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/products/8494058465729906530`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/products/idOrSlug
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/products/idOrSlug`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/products/idOrSlug/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/products/idOrSlug/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/docs/836015919180564872
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/docs/836015919180564872`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/docs/json/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/docs/json/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/orders
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/orders`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/orders/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/orders/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/orders/913585119119341658
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/orders/913585119119341658`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/orders/admin
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/orders/admin`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/orders/admin/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/orders/admin/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/orders/admin/8908923351233057963
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/orders/admin/8908923351233057963`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/orders/admin/all
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/orders/admin/all`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/orders/admin/all/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/orders/admin/all/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/orders/admin/stats
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/orders/admin/stats`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/orders/admin/stats/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/orders/admin/stats/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/orders/id
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/orders/id`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/orders/id/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/orders/id/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/orders/id/3074349547844201289
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/orders/id/3074349547844201289`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/search
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/search`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/search/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/search/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/search/1791989588455378668
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/search/1791989588455378668`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/search/actuator/health
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/search/actuator/health`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/search/popular/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/search/popular/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/search/suggest
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/search/suggest`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/search/suggest/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/search/suggest/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/computeMetadata/v1/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/computeMetadata/v1/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `403`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/health
  * Node Name: `https://dls03qes9fc77.cloudfront.net/health`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/health/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/health/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/latest/meta-data/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/latest/meta-data/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `403`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/metadata/instance
  * Node Name: `https://dls03qes9fc77.cloudfront.net/metadata/instance`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `403`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/metrics
  * Node Name: `https://dls03qes9fc77.cloudfront.net/metrics`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/metrics/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/metrics/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/metrics/4835326925883131267
  * Node Name: `https://dls03qes9fc77.cloudfront.net/metrics/4835326925883131267`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/metrics/cache
  * Node Name: `https://dls03qes9fc77.cloudfront.net/metrics/cache`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/metrics/cache/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/metrics/cache/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/opc/v1/instance/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/opc/v1/instance/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `403`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/ready
  * Node Name: `https://dls03qes9fc77.cloudfront.net/ready`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/ready/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/ready/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/auth/me
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/auth/me`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/auth/me/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/auth/me/`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/categories/id
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/categories/id`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/categories/id/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/categories/id/`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/products/id
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/products/id`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/products/id/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/products/id/`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/orders/id/status
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/orders/id/status`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/orders/id/status/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/orders/id/status/`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/auth/change-password
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/auth/change-password`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/auth/change-password/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/auth/change-password/`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/auth/login
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/auth/login`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/auth/login/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/auth/login/`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/auth/logout
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/auth/logout`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/auth/logout/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/auth/logout/`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/auth/register
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/auth/register`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/auth/register/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/auth/register/`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/categories
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/categories`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/categories/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/categories/`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/products
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/products`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/products/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/products/`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/orders/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/orders/`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/orders/id/cancel
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/orders/id/cancel`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/orders/id/cancel/
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/orders/id/cancel/`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``


Instances: 82

### Solution



### Reference



#### CWE Id: [ 388 ](https://cwe.mitre.org/data/definitions/388.html)


#### WASC Id: 20

#### Source ID: 4

### [ Modern Web Application ](https://www.zaproxy.org/docs/alerts/10109/)



##### Informational (Medium)

### Description

The application appears to be a modern web application. If you need to explore it automatically then the Ajax Spider may well be more effective than the standard one.

* URL: https://dls03qes9fc77.cloudfront.net/health
  * Node Name: `https://dls03qes9fc77.cloudfront.net/health`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<a href="#" class="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Twitter"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-twitter w-5 h-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg></a>`
  * Other Info: `Links have been found that do not have traditional href attributes, which is an indication that this is a modern web application.`
* URL: https://dls03qes9fc77.cloudfront.net/metrics/cache
  * Node Name: `https://dls03qes9fc77.cloudfront.net/metrics/cache`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<a href="#" class="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Twitter"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-twitter w-5 h-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg></a>`
  * Other Info: `Links have been found that do not have traditional href attributes, which is an indication that this is a modern web application.`
* URL: https://dls03qes9fc77.cloudfront.net/ready
  * Node Name: `https://dls03qes9fc77.cloudfront.net/ready`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<a href="#" class="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Twitter"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-twitter w-5 h-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg></a>`
  * Other Info: `Links have been found that do not have traditional href attributes, which is an indication that this is a modern web application.`


Instances: 3

### Solution

This is an informational alert and so no changes are required.

### Reference




#### Source ID: 3

### [ Non-Storable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are not storable by caching components such as proxy servers. If the response does not contain sensitive, personal or user-specific information, it may benefit from being stored and cached, to improve performance.

* URL: https://dls03qes9fc77.cloudfront.net/api/auth/me
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/auth/me`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/health
  * Node Name: `https://dls03qes9fc77.cloudfront.net/health`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `no-store`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/ready
  * Node Name: `https://dls03qes9fc77.cloudfront.net/ready`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `no-store`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/auth/login
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/auth/login`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/auth/register
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/auth/register`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `422`
  * Other Info: ``

Instances: Systemic


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

* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/categories
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/categories`
  * Method: `GET`
  * Parameter: `cache-control`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/products
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/products`
  * Method: `GET`
  * Parameter: `cache-control`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/docs/json
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/docs/json`
  * Method: `GET`
  * Parameter: `cache-control`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://dls03qes9fc77.cloudfront.net/api/search/popular
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/search/popular`
  * Method: `GET`
  * Parameter: `cache-control`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 4

### Solution

For secure content, ensure the cache-control HTTP header is set with "no-cache, no-store, must-revalidate". If an asset should be cached consider setting the directives "public, max-age, immutable".

### Reference


* [ https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#web-content-caching ](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#web-content-caching)
* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control)
* [ https://grayduck.mn/2021/09/13/cache-control-recommendations/ ](https://grayduck.mn/2021/09/13/cache-control-recommendations/)


#### CWE Id: [ 525 ](https://cwe.mitre.org/data/definitions/525.html)


#### WASC Id: 13

#### Source ID: 3

### [ Storable and Cacheable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are storable by caching components such as proxy servers, and may be retrieved directly from the cache, rather than from the origin server by the caching servers, in response to similar requests from other users. If the response data is sensitive, personal or user-specific, this may result in sensitive information being leaked. In some cases, this may even result in a user gaining complete control of the session of another user, depending on the configuration of the caching components in use in their environment. This is primarily an issue where "shared" caching servers such as "proxy" caches are configured on the local network. This configuration is typically found in corporate or educational environments, for instance.

* URL: https://dls03qes9fc77.cloudfront.net/api/catalog/categories/idOrSlug
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/catalog/categories/idOrSlug`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: https://dls03qes9fc77.cloudfront.net/api/docs/json
  * Node Name: `https://dls03qes9fc77.cloudfront.net/api/docs/json`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`


Instances: 2

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


