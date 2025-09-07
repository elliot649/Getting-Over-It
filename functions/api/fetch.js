export async function onRequest({ request }) {
  const url = new URL(request.url).searchParams.get("u");
  if (!url) {
    return new Response("Missing ?u= parameter", { status: 400 });
  }

  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (VirtualBrowser)" }
    });

    let contentType = resp.headers.get("content-type") || "text/html";
    let body = await resp.text();

    const headers = new Headers();
    headers.set("content-type", contentType);

    if (contentType.includes("text/html")) {
      // Rewrite relative links and resources
      body = body.replace(/(src|href)=["'](?!https?:)([^"']+)["']/g,
        (match, attr, link) =>
          `${attr}="${"/api/fetch?u=" + encodeURIComponent(new URL(link, url).href)}"`);

      // Allow YouTube iframes to pass through
      body = body.replace(/<iframe[^>]+src=["']https?:\/\/www\.youtube\.com[^"']+["'][^>]*>/g, (match) => {
        // Keep the iframe as-is, no rewrite
        return match;
      });
    }

    return new Response(body, { headers });
  } catch (err) {
    return new Response("Fetch error: " + err.message, { status: 500 });
  }
}
