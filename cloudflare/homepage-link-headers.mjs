const HOMEPAGE_PATHS = new Set(["/", "/index.html"]);

const DISCOVERY_LINKS = [
  {
    href: "/.well-known/service-desc.json",
    rel: "service-desc",
    type: "application/json",
  },
  {
    href: "/agent/",
    rel: "service-doc",
    type: "text/html",
  },
  {
    href: "/about/",
    rel: "describedby",
    type: "text/html",
  },
];

export function appendDiscoveryHeaders(headers) {
  for (const link of DISCOVERY_LINKS) {
    let value = `<${link.href}>; rel="${link.rel}"`;
    if (link.type) {
      value += `; type="${link.type}"`;
    }
    headers.append("Link", value);
  }
}

export default {
  async fetch(request) {
    const response = await fetch(request);
    const url = new URL(request.url);

    if (!HOMEPAGE_PATHS.has(url.pathname)) {
      return response;
    }

    const headers = new Headers(response.headers);
    appendDiscoveryHeaders(headers);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
