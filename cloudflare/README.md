# Homepage Link Headers

This site is currently served from GitHub Pages behind Cloudflare, so the
origin cannot emit custom `Link` response headers on `/`.

Use the Worker in [homepage-link-headers.mjs](./homepage-link-headers.mjs) on
the `rmmod.com/*` route to append RFC 8288 discovery headers on the homepage:

- `</.well-known/service-desc.json>; rel="service-desc"; type="application/json"`
- `</agent/>; rel="service-doc"; type="text/html"`
- `</about/>; rel="describedby"; type="text/html"`

If you prefer Cloudflare Transform Rules instead of a Worker, configure a rule
that matches `Hostname equals rmmod.com` and `Path equals /`, then append the
same `Link` header values above.
