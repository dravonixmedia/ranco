// Serves the built site from the ASSETS binding and applies maintenance mode.
//
// While maintenance is on, every page URL returns the maintenance page as
// 503 + Retry-After, so search engines treat the outage as temporary and keep
// existing rankings. Images, fonts, scripts, favicon.ico, robots.txt and
// sitemap.xml never reach this Worker (see run_worker_first in wrangler.jsonc)
// and are served with 200.

interface Env {
  ASSETS: Fetcher
  /** "on" or "off". Anything else (missing, empty, misspelt) means "on". */
  MAINTENANCE_MODE?: string
  /** Positive whole number of seconds for Retry-After. */
  MAINTENANCE_RETRY_AFTER_SECONDS?: string
}

const DEFAULT_RETRY_AFTER_SECONDS = 259200 // 3 days

/**
 * Fail-safe: only an explicit "off" serves the site normally. A missing or
 * invalid value keeps the maintenance page up rather than exposing the site
 * by accident.
 */
export function isMaintenanceOn(value: string | undefined): boolean {
  const mode = value?.trim().toLowerCase()
  if (mode === 'off') return false
  if (mode !== 'on') {
    console.warn(`MAINTENANCE_MODE is ${JSON.stringify(value)}; expected "on" or "off". Serving maintenance page.`)
  }
  return true
}

export function retryAfterSeconds(value: string | undefined): string {
  const seconds = Number(value?.trim())
  return String(value?.trim() && Number.isInteger(seconds) && seconds > 0 ? seconds : DEFAULT_RETRY_AFTER_SECONDS)
}

export default {
  async fetch(request, env): Promise<Response> {
    if (!isMaintenanceOn(env.MAINTENANCE_MODE)) return env.ASSETS.fetch(request)

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
    headers.set('Retry-After', retryAfterSeconds(env.MAINTENANCE_RETRY_AFTER_SECONDS))
    headers.set('Cache-Control', 'no-store')

    return new Response(response.body, { status: 503, statusText: 'Service Unavailable', headers })
  },
} satisfies ExportedHandler<Env>
