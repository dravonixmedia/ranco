// Tests for the Workers Builds branch and deploy guard (node --test).
import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, test } from 'node:test'
import { checkPreviewBuild, checkWrangler, isPreviewBuild, planBuild } from './ci-guard.mjs'

const ci = (branch) => ({ WORKERS_CI: '1', WORKERS_CI_BRANCH: branch })
const temps = []
after(() => Promise.all(temps.map((d) => rm(d, { recursive: true, force: true }))))

test('npm run build: production locally and on main, preview on any other branch', () => {
  assert.deepEqual([planBuild({}).ok, planBuild({}).mode], [true, 'production'])
  assert.equal(planBuild(ci('main')).mode, 'production')
  assert.equal(planBuild(ci('feature/premium-website')).mode, 'preview')
  assert.equal(planBuild({ WORKERS_CI: '1' }).ok, false, 'unknown branch in CI is unsafe')
})

test('npm run build:preview never runs on main in Workers Builds', () => {
  assert.equal(checkPreviewBuild({}).ok, true)
  assert.equal(checkPreviewBuild(ci('feature/premium-website')).ok, true)
  assert.equal(checkPreviewBuild(ci('main')).ok, false)
  assert.equal(checkPreviewBuild({ WORKERS_CI: '1' }).ok, false)
})

test('wrangler deploy only from main in Workers Builds', () => {
  assert.equal(checkWrangler({ command: 'deploy', env: ci('main'), previewBuild: false }).ok, true)
  assert.equal(checkWrangler({ command: 'deploy', env: ci('feature/premium-website'), previewBuild: false }).ok, false)
  assert.equal(checkWrangler({ command: 'deploy', env: { WORKERS_CI: '1' }, previewBuild: false }).ok, false)
})

test('wrangler preview is allowed on preview branches; unknown commands off main are refused', () => {
  assert.equal(checkWrangler({ command: 'preview', env: ci('feature/premium-website'), previewBuild: true }).ok, true)
  assert.equal(checkWrangler({ command: 'versions', env: ci('feature/x'), previewBuild: true }).ok, true)
  assert.equal(checkWrangler({ command: '', env: ci('feature/x'), previewBuild: true }).ok, false)
  assert.equal(checkWrangler({ command: 'dev', env: {}, previewBuild: true }).ok, true, 'local dev is never blocked')
})

test('a preview build can never be deployed to production, even locally or from main', () => {
  assert.equal(checkWrangler({ command: 'deploy', env: {}, previewBuild: true }).ok, false)
  assert.equal(checkWrangler({ command: 'deploy', env: ci('main'), previewBuild: true }).ok, false)
  assert.equal(checkWrangler({ command: 'deploy', env: {}, previewBuild: false }).ok, true)
})

test('preview builds are recognised by their robots.txt', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'ranco-guard-'))
  temps.push(dir)
  assert.equal(isPreviewBuild(dir), false, 'no robots.txt')
  await writeFile(path.join(dir, 'robots.txt'), 'User-agent: *\nAllow: /\n\nSitemap: https://ranco.in/sitemap.xml\n')
  assert.equal(isPreviewBuild(dir), false, 'production robots.txt')
  await writeFile(path.join(dir, 'robots.txt'), 'User-agent: *\nDisallow: /\n')
  assert.equal(isPreviewBuild(dir), true, 'preview robots.txt')
})

test('the Wrangler subcommand is read from Wrangler itself, not from arguments mentioning it', async () => {
  const { subcommandFrom } = await import('./ci-guard.mjs')
  assert.equal(subcommandFrom(['/bin/sh', '-c', 'node scripts/ci-guard.mjs wrangler']), null)
  assert.equal(subcommandFrom(['/opt/node22/bin/node', '--no-warnings', '/repo/node_modules/wrangler/wrangler-dist/cli.js', 'deploy', '--dry-run']), 'deploy')
  assert.equal(subcommandFrom(['node', 'node_modules/.bin/wrangler', 'preview']), 'preview')
  assert.equal(subcommandFrom(['npx', 'wrangler', '--config', 'x', 'dev']), 'x', 'flags with values are not parsed; first bare word wins')
  assert.equal(subcommandFrom(['node', 'something-else.js']), null)
})
