// Serves the built site from the ASSETS binding. While MAINTENANCE_MODE is
// "on", HTML documents are returned as 503 + Retry-After so search engines
// treat the outage as temporary and keep existing rankings. Images, fonts,
// scripts and robots.txt never reach this Worker (see run_worker_first in
// wrangler.jsonc) and are served with 200.

interface Env {
  ASSETS: Fetcher
  MAINTENANCE_MODE?: string
  MAINTENANCE_RETRY_AFTER_SECONDS?: string
}

const DEFAULT_RETRY_AFTER_SECONDS = 259200 // 3 days

function retryAfter(value: string | undefined): string {
  const seconds = Number(value)
  return String(Number.isInteger(seconds) && seconds > 0 ? seconds : DEFAULT_RETRY_AFTER_SECONDS)
}

export default {
  async fetch(request, env): Promise<Response> {
    // Only an explicit "on" enables maintenance, so a missing or mistyped
    // value can never leave the launched site stuck on 503.
    if (env.MAINTENANCE_MODE?.trim().toLowerCase() !== 'on') return env.ASSETS.fetch(request)

    // Drop conditional headers so a cached copy can't turn the 503 into a 304.
    const headersIn = new Headers(request.headers)
    headersIn.delete('If-None-Match')
    headersIn.delete('If-Modified-Since')
    let response = await env.ASSETS.fetch(new Request(request, { headers: headersIn }))

    // Every page URL (including old URLs from the previous site) shows the
    // maintenance page, so none of them is reported to search engines as 404.
    if (response.status === 404) {
      response = await env.ASSETS.fetch(new Request(new URL('/', request.url), { method: request.method, headers: headersIn }))
    }

    const type = response.headers.get('content-type') ?? ''
    if (!response.ok || !type.includes('text/html')) return response

    const headers = new Headers(response.headers)
    headers.set('Retry-After', retryAfter(env.MAINTENANCE_RETRY_AFTER_SECONDS))
    headers.set('Cache-Control', 'no-store')

    return new Response(response.body, { status: 503, statusText: 'Service Unavailable', headers })
  },
} satisfies ExportedHandler<Env>
