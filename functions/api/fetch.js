export async function onRequest({ request }) {
  const url = new URL(request.url).searchParams.get("u");
  if (!url) {
    return new Response("Missing ?u= parameter", { status: 400 });
  }

  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (VirtualBrowser)"
      }
    });

    let contentType = resp.headers.get("content-type") || "text/html";
    let body = await resp.text();

    // Remove CSP and X-Frame-Options headers to allow iframe + JS
    const headers = new Headers();
    headers.set("content-type", contentType);

    // Rewrite relative links so scripts, CSS, images still load
    if (contentType.includes("text/html")) {
      body = body.replace(/(src|href)=["'](?!https?:)([^"']+)["']/g,
        (match, attr, link) =>
          `${attr}="${"/api/fetch?u=" + encodeURIComponent(new URL(link, url).href)}"`);
    }

    return new Response(body, { headers });
  } catch (err) {
    return new Response("Fetch error: " + err.message, { status: 500 });
  }
}
