// Safety guard for Cloudflare Workers Builds. Run before each build:
//
//   node scripts/ci-guard.mjs production   (npm run build)
//   node scripts/ci-guard.mjs preview      (npm run build:preview)
//
// Workers Builds sets WORKERS_CI=1 and WORKERS_CI_BRANCH. If a dashboard
// setting is ever mixed up, the build fails instead of putting the
// non-indexed draft site on ranco.in, or a production build on a preview.
// Local builds (no WORKERS_CI) are never blocked.
const PRODUCTION_BRANCH = 'main'

export function checkBuild(mode, env = process.env) {
  if (env.WORKERS_CI !== '1') return { ok: true, reason: 'local build' }
  const branch = env.WORKERS_CI_BRANCH
  if (!branch) return { ok: false, reason: 'WORKERS_CI_BRANCH is not set, so the branch cannot be checked' }
  if (mode === 'production' && branch !== PRODUCTION_BRANCH) {
    return { ok: false, reason: `production build requested on branch "${branch}"; only "${PRODUCTION_BRANCH}" builds production. Use "npm run build:preview" for preview builds.` }
  }
  if (mode === 'preview' && branch === PRODUCTION_BRANCH) {
    return { ok: false, reason: `preview build requested on "${PRODUCTION_BRANCH}"; production must use "npm run build".` }
  }
  return { ok: true, reason: `${mode} build on branch "${branch}"` }
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const mode = process.argv[2]
  if (mode !== 'production' && mode !== 'preview') {
    console.error('usage: node scripts/ci-guard.mjs production|preview')
    process.exit(2)
  }
  const result = checkBuild(mode)
  if (!result.ok) {
    console.error(`ci-guard: build stopped: ${result.reason}`)
    process.exit(1)
  }
  console.log(`ci-guard: ${result.reason}`)
}
