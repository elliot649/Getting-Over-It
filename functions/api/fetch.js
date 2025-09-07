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

    // 🔑 Rewrite relative links so CSS, JS, and images still load
    if (contentType.includes("text/html")) {
      body = body.replace(/(src|href)=["'](?!https?:)([^"']+)["']/g,
        (match, attr, link) =>
          `${attr}="${"/api/fetch?u=" + encodeURIComponent(new URL(link, url).href)}"`);
    }

    return new Response(body, {
      headers: { "content-type": contentType }
    });
  } catch (err) {
    return new Response("Fetch error: " + err.message, { status: 500 });
  }
}
