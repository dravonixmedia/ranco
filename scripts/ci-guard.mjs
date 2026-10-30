// Safety guard for Cloudflare Workers Builds.
//
//   node scripts/ci-guard.mjs build     npm run build: production build on main,
//                                       preview build on any other branch
//   node scripts/ci-guard.mjs preview   npm run build:preview: never on main
//   node scripts/ci-guard.mjs wrangler  wrangler.jsonc custom build: runs before
//                                       wrangler deploy/preview/dev uploads anything
//
// Workers Builds runs the same build command for production and preview builds
// (only the deploy step differs: wrangler deploy vs wrangler preview), so the
// build itself chooses the right output from the branch Workers Builds reports.
// Production is protected at deploy time: wrangler deploy is refused for any
// branch other than main, and for any preview build, wherever it runs.
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PRODUCTION_BRANCH = 'main'
const ROOT = fileURLToPath(new URL('..', import.meta.url))

const inCi = (env) => env.WORKERS_CI === '1'

/** Which build `npm run build` should produce. */
export function planBuild(env = process.env) {
  if (!inCi(env)) return { ok: true, mode: 'production', reason: 'local build' }
  const branch = env.WORKERS_CI_BRANCH
  if (!branch) return { ok: false, reason: 'WORKERS_CI_BRANCH is not set, so the branch cannot be checked' }
  if (branch === PRODUCTION_BRANCH) return { ok: true, mode: 'production', reason: `production build on "${branch}"` }
  return { ok: true, mode: 'preview', reason: `branch "${branch}" is not "${PRODUCTION_BRANCH}": running npm run build:preview` }
}

/** `npm run build:preview` must never run on the production branch. */
export function checkPreviewBuild(env = process.env) {
  if (!inCi(env)) return { ok: true, reason: 'local build' }
  const branch = env.WORKERS_CI_BRANCH
  if (!branch) return { ok: false, reason: 'WORKERS_CI_BRANCH is not set, so the branch cannot be checked' }
  if (branch === PRODUCTION_BRANCH) {
    return { ok: false, reason: `preview build requested on "${PRODUCTION_BRANCH}"; production must use "npm run build".` }
  }
  return { ok: true, reason: `preview build on branch "${branch}"` }
}

/** A preview build is identified by its robots.txt, which blocks all crawling. */
export function isPreviewBuild(distDir) {
  const robots = path.join(distDir, 'robots.txt')
  return existsSync(robots) && /^Disallow:\s*\/\s*$/m.test(readFileSync(robots, 'utf8'))
}

/** Rules for the Wrangler command about to upload. `command` is deploy, preview, dev, versions, … or '' if unknown. */
export function checkWrangler({ command, env = process.env, previewBuild }) {
  if (command === 'deploy' && previewBuild) {
    return { ok: false, reason: 'dist/ is a preview build (robots.txt blocks crawling); refusing wrangler deploy. Run "npm run build" first.' }
  }
  if (!inCi(env)) return { ok: true, reason: `local wrangler ${command || '(unknown command)'}` }
  const branch = env.WORKERS_CI_BRANCH
  if (branch === PRODUCTION_BRANCH) return { ok: true, reason: `wrangler ${command || '(unknown command)'} on "${branch}"` }
  if (command === 'preview' || command === 'versions') return { ok: true, reason: `wrangler ${command} on branch "${branch}"` }
  return { ok: false, reason: `wrangler ${command || '(unrecognised command)'} on branch "${branch || '(unknown)'}"; only "${PRODUCTION_BRANCH}" may deploy production. Preview builds must use "npx wrangler preview".` }
}

/** True for Wrangler's own entry point (…/wrangler/wrangler-dist/cli.js, …/.bin/wrangler, wrangler), not for arguments that merely mention it. */
const isWranglerEntry = (arg) => /[\\/]wrangler[\\/]wrangler-dist[\\/]cli\.js$/.test(arg) || /(^|[\\/])wrangler(\.js)?$/.test(arg)

/** The Wrangler subcommand in a process's arguments, or null if the process is not Wrangler. */
export function subcommandFrom(args) {
  const at = args.findIndex(isWranglerEntry)
  return at === -1 ? null : (args.slice(at + 1).find((a) => !a.startsWith('-')) ?? '')
}

function processInfo(pid) {
  try {
    const args = readFileSync(`/proc/${pid}/cmdline`, 'utf8').split('\0').filter(Boolean)
    const parent = Number(readFileSync(`/proc/${pid}/stat`, 'utf8').split(') ')[1].split(' ')[1])
    return { args, parent }
  } catch {
    // No /proc (for example macOS): fall back to ps. Arguments are split on spaces, which is enough here.
    const out = spawnSync('ps', ['-o', 'ppid=,args=', '-p', String(pid)], { encoding: 'utf8' }).stdout?.trim()
    if (!out) return null
    const [ppid, ...args] = out.split(/\s+/)
    return { args, parent: Number(ppid) }
  }
}

/** The Wrangler subcommand (deploy, preview, dev, …) that started this process, or '' if it cannot be found. */
export function wranglerCommand(startPid = process.ppid) {
  let pid = startPid
  for (let depth = 0; depth < 8 && pid > 1; depth++) {
    const info = processInfo(pid)
    if (!info) break
    const command = subcommandFrom(info.args)
    if (command !== null) return command
    pid = info.parent
  }
  return ''
}

function stop(reason) {
  console.error(`ci-guard: build stopped: ${reason}`)
  process.exit(1)
}

function run(command, env) {
  const result = spawnSync(command, { cwd: ROOT, env, stdio: 'inherit', shell: true })
  process.exit(result.status ?? 1)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2]
  if (mode === 'build') {
    const plan = planBuild()
    if (!plan.ok) stop(plan.reason)
    console.log(`ci-guard: ${plan.reason}`)
    run(plan.mode === 'preview' ? 'npm run build:preview' : 'npm run build:site', process.env)
  } else if (mode === 'preview') {
    const result = checkPreviewBuild()
    if (!result.ok) stop(result.reason)
    console.log(`ci-guard: ${result.reason}`)
  } else if (mode === 'wrangler') {
    const result = checkWrangler({ command: wranglerCommand(), previewBuild: isPreviewBuild(path.join(ROOT, 'dist')) })
    if (!result.ok) stop(result.reason)
    console.log(`ci-guard: ${result.reason}`)
  } else {
    console.error('usage: node scripts/ci-guard.mjs build|preview|wrangler')
    process.exit(2)
  }
}
