// Serves HTML pages with "503 Service Unavailable" + Retry-After while the
// site is under maintenance, so search engines treat the outage as temporary
// and keep existing rankings. Static assets (images, fonts) stay 200.
//
// Turn maintenance off without a code change by setting the Pages
// environment variable MAINTENANCE_MODE=off and redeploying.

const RETRY_AFTER_SECONDS = 259200; // 3 days

export async function onRequest(context) {
  const response = await context.next();

  if (context.env.MAINTENANCE_MODE === "off") return response;

  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;

  const headers = new Headers(response.headers);
  headers.set("Retry-After", String(RETRY_AFTER_SECONDS));
  headers.set("Cache-Control", "no-store");

  return new Response(response.body, { status: 503, statusText: "Service Unavailable", headers });
}
